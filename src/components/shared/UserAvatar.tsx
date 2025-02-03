import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  profilePicture: string | null;
  name: string;
  size?: "sm" | "md";
}

const UserAvatar = ({ profilePicture, name, size = "md" }: UserAvatarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getBgColor = (name: string) => {
    const index = name.length % 7;
    const PASTEL_COLORS = [
      "bg-[#F2FCE2]", "bg-[#FEF7CD]", "bg-[#FEC6A1]", 
      "bg-[#E5DEFF]", "bg-[#FFDEE2]", "bg-[#FDE1D3]", 
      "bg-[#D3E4FD]"
    ];
    return PASTEL_COLORS[index];
  };

  return (
    <Avatar className={size === "sm" ? "h-8 w-8" : "h-10 w-10"}>
      <AvatarImage src={profilePicture || undefined} />
      <AvatarFallback 
        className={`${getBgColor(name)} text-gray-600 font-bold ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;