# IdeaSpark Feature Implementation TODO

## Analysis Summary
- Idea rating: Missing - no rating field in Idea model, no rating in controller or UI.
- Comments: Comment model exists but empty - need to implement comment system.
- Analytics dashboard: Missing - no analytics page or features.
- Public forums: Missing - no forum page or model.
- Investor pitch submissions: Partially present - InvestorDashboard shows ideas but no pitch submission feature.
- Hackathon judging and ranking: Missing - Hackathon model empty, no judging in controller or UI.
- Other features like team formation, idea posting, auth seem present.

## Detailed Implementation Steps
1. [x] Add rating system to ideas
   - Update Idea.js model to include rating field (e.g., averageRating, totalRatings)
   - Add rateIdea endpoint in ideaController.js
   - Update IdeaDetails.js to display and allow rating
2. [x] Implement comment system
   - Populate Comment.js model with schema (idea, author, content, timestamps)
   - Add comment endpoints in ideaController.js (addComment, getComments)
   - Update IdeaDetails.js to display and add comments
3. [x] Create analytics dashboard
   - Create new page Analytics.js in client/src/pages/
   - Add analytics routes and controller in server
   - Include charts for trending ideas, engagement metrics
4. [x] Implement public forums
   - Create Forum.js model (topic, posts, etc.)
   - Create Forums.js page in client
   - Add forum routes and controller
5. [x] Enhance investor module with pitch submissions
   - Update InvestorDashboard.js to include pitch submission form
   - Add pitch model or extend Idea model
   - Add pitch submission endpoint
6. [x] Add hackathon judging and ranking
   - Populate Hackathon.js model with judging fields (submissions, judges, rankings)
   - Update hackathonController.js with judging endpoints
   - Update Hackathons.js page to show rankings and judging interface
7. [x] Update TODO.md as each step is completed
8. [x] Test all new features for integration - Server startup error fixed by adding missing route requires in server.js
