import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, Plus, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

import { useStudents } from "@/hooks/useStudents";
import type { Student } from "@/api";

export function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { students, isLoading, error, deleteStudent } = useStudents();

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    const query = searchQuery.toLowerCase();
    return students.filter((student) =>
      student.name.toLowerCase().includes(query) ||
      student.major.toLowerCase().includes(query) ||
      String(student.group_id).includes(query)
    );
  }, [students, searchQuery]);

  const handleExpel = useCallback(async (id: number) => {
    if (window.confirm("Are you sure you want to remove this student?")) {
      try {
        await deleteStudent(id);
      } catch (err) {
        console.error("Failed to delete:", err);
        alert("Failed to delete student. See console for details.");
      }
    }
  }, [deleteStudent]);

  const columns = useMemo<ColumnDef<Student>[]>(() => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{row.original.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">ID: {row.original.id}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "group_id",
      header: "Group",
      cell: ({ row }) => <Badge variant="outline">Group #{row.original.group_id}</Badge>,
    },
    {
      accessorKey: "major",
      header: "Major",
    },
    {
      accessorKey: "course_year",
      header: "Year",
      cell: ({ row }) => <Badge variant="secondary">Year {row.original.course_year}</Badge>,
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => <span className="capitalize">{row.original.gender}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleExpel(row.original.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Expel Student"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [handleExpel]);

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage student body.</p>
        </div>
        <Link to="/dashboard/students/add">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>Total Students: {students.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, major, or group ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <DataTable columns={columns} data={filteredStudents} />
          
        </CardContent>
      </Card>
    </div>
  );
}