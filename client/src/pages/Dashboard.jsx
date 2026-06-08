import { useQuery } from "@tanstack/react-query";
import { getMeetings } from "../services/api";
import { createMeeting } from "../services/api";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
function Dashboard() {
  const {
    data: meetings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["meetings"],
    queryFn: getMeetings,
  });
  const handleCreateMeeting = async () => {
  const title = prompt(
    "Enter meeting title"
  );

  if (!title) return;

  await createMeeting(title);

  queryClient.invalidateQueries({
    queryKey: ["meetings"],
  });
};
const queryClient = useQueryClient();
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold">
          IntellMeet Dashboard
        </h1>

        <button onClick={handleCreateMeeting} className="bg-blue-500 px-4 py-2 rounded">
          Create Meeting
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">
          My Meetings
        </h2>

        {isLoading && (
          <p className="mt-4">
            Loading...
          </p>
        )}

        {error && (
          <p className="mt-4 text-red-500">
            Error loading meetings
          </p>
        )}

        {meetings?.length === 0 && (
          <div className="mt-4 border p-4 rounded">
            No meetings yet
          </div>
        )}

        {Array.isArray(meetings) &&
  meetings.map((meeting) => (
          <div
            key={meeting._id}
            className="mt-4 border p-4 rounded"
          >
            <Link
  to={`/meeting/${meeting.meetingCode}`}
>
  <div className="mt-4 border p-4 rounded cursor-pointer hover:bg-gray-800">
    <h3 className="font-bold">
      {meeting.title}
    </h3>

    <p>
      Code: {meeting.meetingCode}
    </p>
  </div>
</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;