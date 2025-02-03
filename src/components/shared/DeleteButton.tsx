import { Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

interface DeleteButtonProps {
  onDelete: () => void;
  type: "post" | "comment";
}

const DeleteButton = ({ onDelete, type }: DeleteButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem
          className="flex flex-col items-start gap-1 p-2"
          onClick={onDelete}
        >
          <div className="flex items-center font-semibold">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </div>
          <span className="text-xs text-gray-500">
            This cannot be undone
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DeleteButton;