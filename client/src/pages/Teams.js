import { useState, useEffect } from "react";
import { fetchTeams, createTeam } from "../services/teamService";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await fetchTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error("Error loading teams:", error);
      }
    };
    loadTeams();
  }, []);

  const handleCreateTeam = async () => {
    try {
      await createTeam({ name: newTeamName });
      setNewTeamName("");
      // Reload teams
      const teamsData = await fetchTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  return (
    <div className="teams-page">
      <h2>My Teams</h2>
      <div className="create-team">
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="Team name"
        />
        <button onClick={handleCreateTeam}>Create Team</button>
      </div>
      <div className="teams-list">
        {teams.map((team) => (
          <div key={team._id} className="team-card">
            <h3>{team.name}</h3>
            <p>Members: {team.members?.length || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
