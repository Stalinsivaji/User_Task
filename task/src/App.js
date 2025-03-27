import React, { useEffect, useState } from "react";
import "./App.css"
import axios from "axios";

const App = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setSortBy] = useState("name");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the task list
        const taskResponse = await axios.get(
          "https://nextjs-boilerplate-five-plum-29.vercel.app/api/tasks"
        );
        const tasks = taskResponse.data;

        // Find users who completed all their tasks
        const userCompletionMap = {};
        tasks.forEach((task) => {
          if (!userCompletionMap[task.userId]) {
            userCompletionMap[task.userId] = { total: 0, completed: 0 };
          }
          userCompletionMap[task.userId].total += 1;
          if (task.completed) {
            userCompletionMap[task.userId].completed += 1;
          }
        });

        const completedUserIds = Object.keys(userCompletionMap).filter(
          (id) =>
            userCompletionMap[id].total === userCompletionMap[id].completed
        );

        // Fetch user details in parallel
        const userRequests = completedUserIds.map((id) =>
          axios.get(
            `https://nextjs-boilerplate-five-plum-29.vercel.app/api/users/${id}`
          )
        );

        const userResponses = await Promise.all(userRequests);
        const userData = userResponses.map((res) => res.data);

        setUsers(userData.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSort = (key) => {
    setSortBy(key);
    setUsers((prevUsers) =>
      [...prevUsers].sort((a, b) =>
        key === "id"
          ? a[key] - b[key]
          : a[key].localeCompare(b[key])
      )
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Users Who Completed All Tasks</h2>
      {loading ? (
        <p>Loading...</p>
      ) : users.length > 0 ? (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th onClick={() => handleSort("id")}>ID</th>
              <th onClick={() => handleSort("name")}>Name</th>
              <th onClick={() => handleSort("email")}>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found who have completed all tasks.</p>
      )}
    </div>
  );
};

export default App;
