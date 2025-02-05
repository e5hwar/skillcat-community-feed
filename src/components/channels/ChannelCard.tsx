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
      className="w-[180px] cursor-pointer hover:bg-accent transition-colors"
      onClick={() => navigate(`/channel/${id}`)}
    >
      <CardContent className="p-4 flex items-center gap-3">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-12 h-12 object-cover rounded-full shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-xl font-semibold text-muted-foreground">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h3 className="font-medium text-left">{name}</h3>
      </CardContent>
    </Card>
  );
};

export default ChannelCard;