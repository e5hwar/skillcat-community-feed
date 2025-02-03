interface UserInfoProps {
  name: string;
  bio?: string | null;
  createdAt: string;
  size?: "sm" | "md";
}

const UserInfo = ({ name, bio, createdAt, size = "md" }: UserInfoProps) => {
  return (
    <div>
      <p className={`font-medium text-gray-900 ${size === "sm" ? "text-sm" : ""}`}>
        {name}
      </p>
      {bio && (
        <p className={`text-gray-500 ${size === "sm" ? "text-xs" : "text-sm"}`}>
          {bio}
        </p>
      )}
      <p className="text-xs text-gray-400">
        {createdAt}
      </p>
    </div>
  );
};

export default UserInfo;