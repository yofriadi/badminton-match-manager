import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { ScheduleDateTimePicker } from "@/components/ui/schedule-date-time-picker";
import { Combobox } from "@/components/ui/combobox";
import { getHalls } from "@/app/hall/lib/api";
import { CreateScheduleForm } from "./create-schedule-form";

export default async function CreateSchedulePage() {
  const halls = await getHalls();
  const hallOptions = halls.map((hall) => ({
    label: hall.name,
    value: hall.id,
  }));

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <CreateScheduleForm hallOptions={hallOptions} />
    </div>
  );
}
