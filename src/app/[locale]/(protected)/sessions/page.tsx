import Header from "@/components/header";
import SessionsPage from "@/components/sessions/sessions-page";

type SessionCardData = {
  id: string;
  title: string;
  subtitle: string;
  createdAt: string;
  duration: string;
};

const sampleSessions: SessionCardData[] = [
  {
    id: "1",
    title: "Morning Anxiety Reflection",
    subtitle: "Exploring feelings of uncertainty about the day ahead",
    createdAt: "2025-01-15T09:30:00Z",
    duration: "12 min",
  },
  {
    id: "2",
    title: "Work Stress Processing",
    subtitle: "Reflecting on project deadline pressure and team dynamics",
    createdAt: "2025-01-14T18:45:00Z",
    duration: "18 min",
  },
  {
    id: "3",
    title: "Gratitude and Growth",
    subtitle: "Acknowledging progress and celebrating small wins",
    createdAt: "2025-01-13T20:15:00Z",
    duration: "8 min",
  },
  {
    id: "4",
    title: "Relationship Boundaries",
    subtitle: "Understanding personal limits in close relationships",
    createdAt: "2025-01-12T16:20:00Z",
    duration: "22 min",
  },
  {
    id: "5",
    title: "Creative Block Exploration",
    subtitle: "Working through feelings of stagnation and lack of inspiration",
    createdAt: "2025-01-11T14:30:00Z",
    duration: "15 min",
  },
  {
    id: "6",
    title: "Evening Wind Down",
    subtitle: "Processing the day's events and preparing for rest",
    createdAt: "2025-01-10T21:00:00Z",
    duration: "10 min",
  },
];

export default function SessionsRoute() {
  return (
    <main className="h-screen w-screen bg-mir-bg-primary">
      <SessionsPage sessions={sampleSessions} />
    </main>
  );
}
