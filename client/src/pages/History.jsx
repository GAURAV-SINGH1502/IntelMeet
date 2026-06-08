import { useQuery } from "@tanstack/react-query";
import { getMeetings } from "../services/api";
import { useState } from "react";
import { Link } from "react-router-dom";

function History() {
    const [search, setSearch] =useState("");
    const {
  data: meetings,
  isLoading,
  error,
} = useQuery({
  queryKey: ["meetings"],
  queryFn: getMeetings,
});

const filteredMeetings =
  meetings?.filter(
    (meeting) =>
      meeting.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">

      <h1 className="text-4xl font-bold mb-6">
        📜 Meeting History
      </h1>
      <Link to="/">
  <button
    className="bg-blue-600 px-4 py-2 rounded-lg mb-4"
  >
    ← Back to Dashboard
  </button>
</Link>
<input
  type="text"
  placeholder="Search meetings..."
  value={search}
  onChange={(e) =>
    setSearch(e.target.value)
  }
  className="w-full p-3 rounded-lg bg-gray-800 text-white mb-6"
/>
      {isLoading && (
        <p>Loading...</p>
      )}

      {error && (
        <p className="text-red-500">
          Error loading meetings
        </p>
      )}

      {Array.isArray(meetings) &&
    filteredMeetings?.map((meeting) => (
          <div
            key={meeting._id}
            className="bg-gray-800 p-4 rounded-xl mb-4"
          >
            <h3 className="text-xl font-bold">
              {meeting.title}
            </h3>

            <p>
              Code: {meeting.meetingCode}
            </p>

            <p>
              Created:{" "}
              {new Date(
                meeting.createdAt
              ).toLocaleDateString()}
            </p>

          </div>
        ))}

    </div>
  );
}

export default History;