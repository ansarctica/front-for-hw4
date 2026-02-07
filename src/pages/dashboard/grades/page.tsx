import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trophy, Loader2, Save, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useGrades } from "@/hooks/useGrades"; 
import { useStudents } from "@/hooks/useStudents";
import { useSubjects } from "@/hooks/useSubjects";
const assignmentSchema = z.object({
  subject_name: z.string().min(1, "Subject is required"),
  name: z.string().min(1, "Name is required"),
  weight: z.coerce.number().min(1, "Weight > 0").max(100, "Max 100%"),
  date: z.string().min(1, "Date required"),
});

const gradeSchema = z.object({
  subject_name: z.string().min(1, "Subject required"), 
  assignment_id: z.string().min(1, "Assignment required"),
  student_id: z.string().min(1, "Student required"),
  mark: z.coerce.number().min(0).max(100, "0-100"),
});
export function GradesPage() {
  const { students } = useStudents(); 
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const { createAssignment, createGrade, assignmentsQuery, rankingsQuery } = useGrades();
  const assignmentForm = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      name: "",
      subject_name: "",
      weight: 0,
      date: new Date().toISOString().split('T')[0]
    }
  });
  const gradeForm = useForm({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      subject_name: "",
      assignment_id: "",
      student_id: "",
      mark: 0
    }
  });
  const selectedGradeSubject = gradeForm.watch("subject_name");
  const { data: assignments = [] } = assignmentsQuery(selectedGradeSubject);

  const onAssignmentSubmit = async (data: z.infer<typeof assignmentSchema>) => {
    try {
      const [y, m, d] = data.date.split("-");
      await createAssignment.mutateAsync({ ...data, date: `${d}.${m}.${y}` });
      assignmentForm.reset({ ...data, name: "", weight: 0 }); 
    } catch (e) { console.error(e); }
  };

  const onGradeSubmit = async (data: z.infer<typeof gradeSchema>) => {
    try {
      await createGrade.mutateAsync({
        assignment_id: Number(data.assignment_id),
        student_id: Number(data.student_id),
        mark: data.mark
      });
      gradeForm.setValue("mark", 0);
      gradeForm.setValue("student_id", "");
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Grades & Analytics</h2>

      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">Manage Grades</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments">
          <div className="grid gap-4 md:grid-cols-2">
            
            {/* LEFT: Assignment Form */}
            <Card>
              <CardHeader><CardTitle>1. New Assignment</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={assignmentForm.handleSubmit(onAssignmentSubmit)} className="space-y-4">
                    <FormField label="Subject" error={assignmentForm.formState.errors.subject_name?.message}>
                      <Select 
                        value={assignmentForm.watch("subject_name")} 
                        onValueChange={v => assignmentForm.setValue("subject_name", v, { shouldValidate: true })}
                      >
                        <SelectTrigger><SelectValue placeholder={subjectsLoading ? "..." : "Select Subject"} /></SelectTrigger>
                        <SelectContent>{(subjects || []).map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Name" error={assignmentForm.formState.errors.name?.message}>
                      <Input placeholder="e.g. Final Exam" {...assignmentForm.register("name")} />
                    </FormField>
                    
                    <div className="flex gap-4">
                        <FormField label="Weight (%)" error={assignmentForm.formState.errors.weight?.message}>
                            <Input type="number" {...assignmentForm.register("weight")} />
                        </FormField>
                        <FormField label="Date" error={assignmentForm.formState.errors.date?.message}>
                            <Input type="date" {...assignmentForm.register("date")} />
                        </FormField>
                    </div>

                    <Button className="w-full" type="submit" disabled={createAssignment.isPending}>
                        {createAssignment.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Create Assignment
                    </Button>
                </form>
              </CardContent>
            </Card>

            {/* RIGHT: Grade Form */}
            <Card className="border-l-4 border-l-primary/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> 2. Grade Student</CardTitle>
                    <CardDescription>Select subject, assignment, then student.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={gradeForm.handleSubmit(onGradeSubmit)} className="space-y-4">
                        <FormField label="Subject Filter" error={gradeForm.formState.errors.subject_name?.message}>
                            <Select 
                                value={gradeForm.watch("subject_name")} 
                                onValueChange={v => {
                                    gradeForm.setValue("subject_name", v, { shouldValidate: true });
                                    gradeForm.setValue("assignment_id", ""); 
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                <SelectContent>{(subjects || []).map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Assignment" error={gradeForm.formState.errors.assignment_id?.message}>
                            <Select 
                                value={gradeForm.watch("assignment_id")}
                                onValueChange={v => gradeForm.setValue("assignment_id", v, { shouldValidate: true })}
                                disabled={!selectedGradeSubject || assignments.length === 0}
                            >
                                <SelectTrigger><SelectValue placeholder={assignments.length === 0 ? "No assignments" : "Select Assignment"} /></SelectTrigger>
                                <SelectContent>
                                    {assignments.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.name} ({a.weight}%)</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <FormField label="Student" error={gradeForm.formState.errors.student_id?.message}>
                                    <Select 
                                        value={gradeForm.watch("student_id")}
                                        onValueChange={v => gradeForm.setValue("student_id", v, { shouldValidate: true })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                                        <SelectContent>{(students || []).map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FormField>
                            </div>
                            <FormField label="Mark" error={gradeForm.formState.errors.mark?.message}>
                                <Input type="number" {...gradeForm.register("mark")} />
                            </FormField>
                        </div>

                        <Button className="w-full" variant="secondary" type="submit" disabled={createGrade.isPending}>
                            {createGrade.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Grade
                        </Button>
                    </form>
                </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rankings">
          <RankingsView subjects={subjects || []} students={students || []} rankingsQuery={rankingsQuery} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
const FormField = ({ label, error, children }: { label: string, error?: string, children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);
function RankingsView({ subjects, students, rankingsQuery }: { subjects: any[], students: any[], rankingsQuery: any }) {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [groupId, setGroupId] = useState("");
  const [debouncedGroupId, setDebouncedGroupId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedGroupId(groupId), 500);
    return () => clearTimeout(timer);
  }, [groupId]);

  const { data: rankings = [] } = rankingsQuery({
    group_id: debouncedGroupId ? Number(debouncedGroupId) : undefined,
    subject_name: selectedSubject,
  });

  const getStudentName = (id: number) => students.find(s => s.id === id)?.name || `Student #${id}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Student Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div className="w-[150px]">
             <FormField label="Group ID"><Input placeholder="e.g. 1" value={groupId} onChange={e => setGroupId(e.target.value)} /></FormField>
          </div>
          <div className="w-[200px]">
             <FormField label="Subject">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger><SelectValue placeholder="All Subjects" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                </Select>
             </FormField>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">GPA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No rankings found.</TableCell></TableRow>
              ) : (
                rankings.map((r: any, i: number) => (
                  <TableRow key={r.student_id}>
                    <TableCell className="font-medium">#{i + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{getStudentName(r.student_id)}</div>
                      <div className="text-xs text-muted-foreground">ID: {r.student_id}</div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">{r.gpa?.toFixed(2) || "0.00"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}