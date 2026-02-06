interface ProfileHeaderProps {
  username: string;
  email: string;
}

export default function ProfileHeader({ username, email }: ProfileHeaderProps) {
  return (
    <div className="profile-header">
      <div className="avatar">{username.charAt(0).toUpperCase()}</div>
      <div className="user-info">
        <h1>{username}</h1>
        <p>{email}</p>
      </div>
    </div>
  );
}
