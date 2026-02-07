import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Loader2, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudents } from "@/hooks/useStudents";
const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  group_id: z.coerce.number().min(1, "Group ID is required"),
  major: z.string().min(2, "Major is required"),
  course_year: z.coerce.number().min(1).max(6, "Year must be 1-6"),
  gender: z.string().min(1, "Gender is required"),
  birth_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export function AddStudentPage() {
  const { createStudent } = useStudents();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      group_id: "" as unknown as number,
      major: "",
      course_year: 1,
      gender: "",
      birth_date: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof studentSchema>) => {
    try {
      const safeDate = `${data.birth_date}T00:00:00Z`;
      
      await createStudent({
        ...data,
        birth_date: safeDate,
      });

      navigate("/dashboard/students");
    } catch (error) {
      console.error("Failed to create student", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="e.g. John Doe" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Group ID */}
            <div className="space-y-2">
              <Label>Group ID</Label>
              <Input type="number" placeholder="e.g. 101" {...register("group_id")} />
              <p className="text-xs text-muted-foreground">Numeric ID of the group.</p>
              {errors.group_id && <p className="text-xs text-destructive">{errors.group_id.message}</p>}
            </div>

            {/* Major */}
            <div className="space-y-2">
              <Label>Major</Label>
              <Input placeholder="e.g. Computer Science" {...register("major")} />
              {errors.major && <p className="text-xs text-destructive">{errors.major.message}</p>}
            </div>

            {/* Course Year */}
            <div className="space-y-2">
              <Label>Course Year</Label>
              <Input type="number" placeholder="1-4" {...register("course_year")} />
              {errors.course_year && <p className="text-xs text-destructive">{errors.course_year.message}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input placeholder="e.g. Male" {...register("gender")} />
              {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label>Birth Date</Label>
              <Input type="date" {...register("birth_date")} />
              {errors.birth_date && <p className="text-xs text-destructive">{errors.birth_date.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard/students")}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Student
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}