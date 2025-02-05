import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ChannelCardProps {
  id: number;
  name: string;
  imageUrl?: string | null;
}

const ChannelCard = ({ id, name, imageUrl }: ChannelCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="w-[200px] cursor-pointer hover:bg-accent transition-colors"
      onClick={() => navigate(`/channel/${id}`)}
    >
      <CardContent className="p-4 flex flex-col items-center gap-3">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-16 h-16 object-cover rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl font-semibold text-muted-foreground">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h3 className="font-medium text-center">{name}</h3>
      </CardContent>
    </Card>
  );
};

export default ChannelCard;