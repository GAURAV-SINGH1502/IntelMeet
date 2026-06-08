import useMeetingStore from "../store/useMeetingStore";
import { useQuery } from "@tanstack/react-query";
import { getMeetings } from "../services/api";
function Profile() {

  const { user } =
    useMeetingStore();
    const {
  data: meetings,
} = useQuery({
  queryKey: ["meetings"],
  queryFn: getMeetings,
});

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">

      <h1 className="text-4xl font-bold mb-6">
        👤 Profile
      </h1>

      <div className="bg-gray-800 p-6 rounded-xl max-w-lg">

        <p className="mb-4">
          <strong>Name:</strong>{" "}
          {user?.name}
        </p>

        <p className="mb-4">
          <strong>Email:</strong>{" "}
          {user?.email}
        </p>
        <p className="mb-4">
  <strong>
    Meetings Created:
  </strong>{" "}
  {meetings?.length || 0}
</p>
      </div>

    </div>
  );
}

export default Profile;