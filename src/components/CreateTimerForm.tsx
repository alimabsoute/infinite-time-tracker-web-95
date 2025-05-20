
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

interface CreateTimerFormProps {
  onAddTimer: (name: string) => void;
}

const CreateTimerForm = ({ onAddTimer }: CreateTimerFormProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddTimer(name.trim());
      setName("");
    }
  };

  return (
    <Card className="p-4 mb-6 shadow-sm bg-white dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Timer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={!name.trim()}>
            <PlusCircle size={18} className="mr-2" />
            Add Timer
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateTimerForm;
