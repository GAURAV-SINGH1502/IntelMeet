import { useQuery } from "@tanstack/react-query";
import { getMeetings } from "../services/api";
import { createMeeting } from "../services/api";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useMeetingStore from "../store/useMeetingStore";
import { deleteMeeting} from "../services/api";
function Dashboard() {
  const {
    data: meetings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["meetings"],
    queryFn: getMeetings,
  });
  const navigate = useNavigate();
const queryClient = useQueryClient();
const { logout , token} =
  useMeetingStore();

const handleLogout = () => {

  logout();

  navigate("/login");

};
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
const handleDeleteMeeting =
  async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this meeting?"
      );

    if (!confirmDelete)
      return;

    try {

      await deleteMeeting(
        id,
        token
      );

      queryClient.invalidateQueries({
  queryKey: ["meetings"],
});

      alert(
        "Meeting Deleted"
      );

    } catch (error) {

      console.log(error);

    }

  };

 return (
  <div className="min-h-screen bg-gray-900 text-white p-8">

    {/* Header */}
    <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">

      <div>
        <h1 className="text-4xl font-bold">
          IntelMeet
        </h1>

        <p className="text-gray-400 mt-1">
          Manage and join your meetings
        </p>
      </div>

      <div className="flex gap-3">

        <button
          onClick={handleCreateMeeting}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-medium"
        >
          ➕ Create Meeting
        </button>
<Link to="/history">
  <button
    className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg"
  >
    📜 History
  </button>
</Link>
<Link to="/profile">
  <button
    className="bg-yellow-600 hover:bg-yellow-700 px-5 py-2 rounded-lg"
  >
    👤 Profile
  </button>
</Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg font-medium"
        >
          🚪 Logout
        </button>

      </div>

    </div>

    {/* Meetings Section */}
    <div>

      <h2 className="text-2xl font-bold mb-6">
        My Meetings
      </h2>

      {isLoading && (
        <div className="bg-gray-800 p-4 rounded-lg">
          Loading meetings...
        </div>
      )}

      {error && (
        <div className="bg-red-900 p-4 rounded-lg">
          Error loading meetings
        </div>
      )}

      {meetings?.length === 0 && (
        <div className="bg-gray-800 p-6 rounded-xl text-center text-gray-400">
          No meetings yet
        </div>
      )}

      {Array.isArray(meetings) &&
        meetings.map((meeting) => (
          <div
            key={meeting._id}
            className="bg-gray-800 rounded-xl p-5 mb-4 shadow-lg hover:shadow-xl transition"
          >

            <h3 className="text-xl font-semibold">
              {meeting.title}
            </h3>

            <div className="flex items-center gap-3 mt-2">
  <p>
    Code:
    <span className="font-mono ml-2">
      {meeting.meetingCode}
    </span>
  </p>

  <button
    onClick={() => {
      navigator.clipboard.writeText(
        meeting.meetingCode
      );

      alert(
        "Meeting code copied!"
      );
    }}
    className="bg-blue-500 px-2 py-1 rounded text-sm"
  >
    📋 Copy
  </button>
</div>

            <p className="text-gray-400 mt-2">
              Created:
              {" "}
              {new Date(
                meeting.createdAt
              ).toLocaleDateString()}
            </p>

            <div className="flex gap-3 mt-5">

              <Link
                to={`/meeting/${meeting.meetingCode}`}
              >
                <button
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                >
                  Join Meeting
                </button>
              </Link>

              <button
                onClick={() =>
                  handleDeleteMeeting(
                    meeting._id
                  )
                }
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
              >
                Delete
              </button>

            </div>

          </div>
        ))}

    </div>

  </div>
);
}

export default Dashboard;