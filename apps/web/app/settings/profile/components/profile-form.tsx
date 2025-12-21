"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import AnimatedCtaButton from "@workspace/ui/components/animated-cta-button";
import { toast } from "sonner";
import { updateTenantAction } from "@/lib/tenant-actions";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  name: z.string().min(1, "Club name is required"),
  description: z.string().nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  tenant: {
    name: string;
    description: string | null;
    contactInfo: any;
  };
}

export function ProfileForm({ tenant }: ProfileFormProps) {
  const router = useRouter();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: tenant.name,
      description: tenant.description,
      email: (tenant.contactInfo as any)?.email ?? "",
      phone: (tenant.contactInfo as any)?.phone ?? "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    try {
      await updateTenantAction({
        name: values.name,
        description: values.description,
        contactInfo: {
          email: values.email,
          phone: values.phone,
        },
      });
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Club Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter club name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about your club..." 
                  className="resize-none h-32"
                  {...field} 
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                A brief overview of your club for players to see.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input placeholder="club@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+62..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center pt-8">
          <AnimatedCtaButton
            type="submit"
            width="220px"
            height="52px"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </AnimatedCtaButton>
        </div>
      </form>
    </Form>
  );
}
