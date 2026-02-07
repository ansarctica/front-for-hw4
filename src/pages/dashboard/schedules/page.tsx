import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSchedules } from "@/hooks";
import type { Schedule } from "@/api";
const formatTime = (dateStr: string) => {
  let date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    date = new Date(`1970-01-01T${dateStr}`);
  }
  if (isNaN(date.getTime())) {
    return dateStr;
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const groupSchedules = (schedules: Schedule[]) => {
  const grouped: Record<number, Schedule[]> = {};
  schedules.forEach((s) => {
    if (!grouped[s.group_id]) {
      grouped[s.group_id] = [];
    }
    grouped[s.group_id].push(s);
  });
  return grouped;
};

export function SchedulesPage() {
  const { schedules, isLoading, error, fetchAllSchedules } = useSchedules();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  useEffect(() => {
    fetchAllSchedules();
  }, [fetchAllSchedules]);

  const groupedData = groupSchedules(schedules);
  const groupIds = Object.keys(groupedData).map(Number);
  useEffect(() => {
    if (groupIds.length > 0 && selectedGroupId === null) {
      setSelectedGroupId(groupIds[0]);
    }
  }, [groupIds, selectedGroupId]);

  const currentScheduleItems = selectedGroupId ? groupedData[selectedGroupId] : [];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (groupIds.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Schedules</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No schedules found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Schedules</h1>
          <p className="text-muted-foreground">
            View class timings for each group
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Schedule</CardTitle>
              <CardDescription>
                Classes for Group #{selectedGroupId}
              </CardDescription>
            </div>
            {selectedGroupId && groupIds.length > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const currentIndex = groupIds.indexOf(selectedGroupId);
                    const prevIndex =
                      currentIndex <= 0 ? groupIds.length - 1 : currentIndex - 1;
                    setSelectedGroupId(groupIds[prevIndex]);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Badge variant="outline" className="px-4 py-2 text-base">
                  Group {selectedGroupId}
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const currentIndex = groupIds.indexOf(selectedGroupId);
                    const nextIndex =
                      currentIndex >= groupIds.length - 1 ? 0 : currentIndex + 1;
                    setSelectedGroupId(groupIds[nextIndex]);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentScheduleItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No classes scheduled.</div>
            ) : (
                currentScheduleItems
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((item) => (
                    <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                    >
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Clock className="h-5 w-5" />
                        </div>
                        <div>
                        <h4 className="font-semibold">{item.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                            {formatTime(item.start_time)} - {formatTime(item.end_time)}
                        </p>
                        </div>
                    </div>
                    </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {groupIds.map((gid) => (
          <Card
            key={gid}
            className={cn(
              "cursor-pointer transition-colors hover:bg-accent",
              selectedGroupId === gid && "border-primary"
            )}
            onClick={() => setSelectedGroupId(gid)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Group {gid}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Classes</span>
                <span className="font-medium">{groupedData[gid].length}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}