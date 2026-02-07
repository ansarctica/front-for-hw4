import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Save } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";

import { useAttendance, useStudents, useSubjects } from "@/hooks";
import type { Attendance } from "@/api";
const formSchema = z.object({
  student_id: z.string().min(1),
  subject_name: z.string().min(1),
  visit_day: z.string().min(1),
  visited: z.boolean(),
});

export function AttendancePage() {
  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { attendance, isLoading, getByStudentId, getBySubjectName, createAttendance, clearAttendance } = useAttendance();

  const [activeTab, setActiveTab] = useState("student");
  const [filterId, setFilterId] = useState(""); 
  const [showForm, setShowForm] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { student_id: "", subject_name: "", visit_day: new Date().toISOString().split("T")[0], visited: true }
  });
  useEffect(() => {
    clearAttendance();
    setFilterId("");
  }, [activeTab, clearAttendance]);

  useEffect(() => {
    if (!filterId) return;
    activeTab === "student" ? getByStudentId(Number(filterId)) : getBySubjectName(filterId);
  }, [filterId, activeTab]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const [y, m, d] = data.visit_day.split("-");
    await createAttendance({
      student_id: Number(data.student_id),
      subject_name: data.subject_name,
      visit_day: `${d}.${m}.${y}`,
      visited: data.visited,
    });
    setShowForm(false);
    form.reset({ ...data, student_id: "", subject_name: "" });
    if (activeTab === "student" && filterId === data.student_id) getByStudentId(Number(filterId));
    if (activeTab === "subject" && filterId === data.subject_name) getBySubjectName(filterId);
  };
  const columns = useMemo<ColumnDef<Attendance>[]>(() => [
    {
      accessorKey: "visit_day",
      header: "Date",
      cell: ({ row }) => new Date(row.original.visit_day).toLocaleDateString(),
    },
    {
      id: "target", 
      header: activeTab === "student" ? "Subject" : "Student",
      cell: ({ row }) => {
        if (activeTab === "student") return row.original.subject_name;
        return students.find(s => s.id === row.original.student_id)?.name || `#${row.original.student_id}`;
      }
    },
    {
      accessorKey: "visited",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.visited ? "default" : "destructive"}>
          {row.original.visited ? "Present" : "Absent"}
        </Badge>
      ),
    },
  ], [activeTab, students]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Mark Attendance</>}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap gap-4 items-end">
              <div className="w-[200px] space-y-2">
                <Label>Student</Label>
                <Select onValueChange={v => form.setValue("student_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                  <SelectContent>{students.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="w-[200px] space-y-2">
                <Label>Subject</Label>
                <Select onValueChange={v => form.setValue("subject_name", v)}>
                  <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                  <SelectContent>{subjects.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="w-[150px] space-y-2">
                <Label>Date</Label>
                <Input type="date" {...form.register("visit_day")} />
              </div>
              <div className="w-[150px] space-y-2">
                <Label>Status</Label>
                <Select defaultValue="true" onValueChange={v => form.setValue("visited", v === "true")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">Present</SelectItem>
                        <SelectItem value="false">Absent</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Report</CardTitle>
          <div className="flex gap-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="student">By Student</TabsTrigger>
                <TabsTrigger value="subject">By Subject</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select onValueChange={setFilterId} value={filterId}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select Filter..." /></SelectTrigger>
              <SelectContent>
                {activeTab === "student" 
                  ? students.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)
                  : subjects.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)
                }
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div> 
           : <DataTable columns={columns} data={attendance} />
          }
        </CardContent>
      </Card>
    </div>
  );
}