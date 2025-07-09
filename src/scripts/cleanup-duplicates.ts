import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';

export async function cleanupDuplicatePhoneNumbers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  // Find all duplicate phone numbers
  const duplicates = await userRepository
    .createQueryBuilder('user')
    .select('user.phoneNumber')
    .addSelect('COUNT(*)', 'count')
    .groupBy('user.phoneNumber')
    .having('COUNT(*) > 1')
    .getRawMany();

  console.log('Found duplicate phone numbers:', duplicates);

  for (const duplicate of duplicates) {
    const phoneNumber = duplicate.user_phoneNumber;

    // Get all users with this phone number
    const usersWithDuplicatePhone = await userRepository.find({
      where: { phoneNumber },
      order: { id: 'ASC' },
    });

    console.log(
      `Processing ${usersWithDuplicatePhone.length} users with phone number: ${phoneNumber}`,
    );

    // Keep the first user (oldest), update the rest
    for (let i = 1; i < usersWithDuplicatePhone.length; i++) {
      const user = usersWithDuplicatePhone[i];
      const newPhoneNumber = `${phoneNumber}_${user.id}`; // Make it unique by appending user ID

      await userRepository.update(user.id, {
        phoneNumber: newPhoneNumber,
      });

      console.log(
        `Updated user ${user.id} phone number from ${phoneNumber} to ${newPhoneNumber}`,
      );
    }
  }

  console.log('Cleanup completed successfully');
}
