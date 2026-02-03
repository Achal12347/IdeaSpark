import { useState, useEffect } from "react";
import { fetchTeams, createTeam } from "../services/teamService";
import "../styles/appPageTheme.css";
import "../styles/Teams.css";

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
    <div className="app-page teams-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h2 className="app-title">My Teams</h2>
            <p className="app-subtitle">Create and manage teams for your ideas.</p>
          </div>
        </div>

        <div className="team-create app-card">
          <div className="team-create-fields">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name"
              className="app-input"
            />
            <button
              className="app-button"
              onClick={handleCreateTeam}
              disabled={!newTeamName.trim()}
            >
              Create Team
            </button>
          </div>
        </div>

        {teams.length === 0 ? (
          <div className="teams-empty app-card">
            <h3>No teams yet</h3>
            <p>Create your first team to start collaborating.</p>
          </div>
        ) : (
          <div className="teams-list app-grid">
            {teams.map((team) => (
              <div key={team._id} className="team-card app-card">
                <h3>{team.name}</h3>
                <p>Members: {team.members?.length || 0}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
