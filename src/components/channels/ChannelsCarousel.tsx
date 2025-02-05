
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import ChannelCard from "./ChannelCard";

const ChannelsCarousel = () => {
  const isMobile = useIsMobile();
  const { data: channels, isLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order('id', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="h-[160px] flex items-center justify-center">Loading channels...</div>;
  }

  return (
    <Carousel 
      className="w-full max-w-5xl mx-auto relative"
      opts={{
        dragFree: false,
        containScroll: "trimSnaps"
      }}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {channels?.map((channel) => (
          <CarouselItem key={channel.id} className="pl-2 md:pl-4 basis-auto">
            <ChannelCard
              id={channel.id}
              name={channel.name}
              imageUrl={channel.image_url}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {!isMobile && (
        <>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </>
      )}
    </Carousel>
  );
};

export default ChannelsCarousel;
