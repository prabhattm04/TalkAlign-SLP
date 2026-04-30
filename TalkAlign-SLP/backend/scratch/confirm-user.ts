import { createAdminClient } from '../src/config/supabase';
import { config } from '../src/config/env';

async function confirmUser(email: string) {
  const supabase = createAdminClient();
  
  console.log(`Searching for user with email: ${email}...`);
  
  // 1. Get the user from Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.error(`User ${email} not found in Auth!`);
    return;
  }
  
  console.log(`Found user: ${user.id}. Confirming email...`);
  
  // 2. Update user to confirm email
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { email_confirm: true }
  );
  
  if (updateError) {
    console.error('Error updating user:', updateError);
    return;
  }
  
  console.log('Success! User confirmed:', updatedUser.user.email);
}

confirmUser('prabhat@gmail.com');
