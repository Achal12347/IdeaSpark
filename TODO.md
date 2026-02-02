# TODO: Fix UI Issues in AdminDashboard and Dashboard

## Phase 1: Analyze and Identify Issues
- [x] Read AdminDashboard.js and Dashboard.js to understand current structure
- [x] Identify non-clickable elements (e.g., "Feed" in Dashboard sidebar)
- [x] Identify elements redirecting to white/poor UI pages (e.g., Investors, Hackathons in AdminDashboard; various navigations in Dashboard)
- [x] Check related pages (Analytics, Reports, TrendingIdeas, etc.) for UI quality

## Phase 2: Fix AdminDashboard Issues
- [ ] Add renderContent cases for "Investors" and "Hackathons" in AdminDashboard.js (currently show default dashboard)
- [ ] Improve UI for Analytics and Reports pages if needed (add proper styling)
- [ ] Ensure all sidebar buttons are functional

## Phase 3: Fix Dashboard Issues
- [x] Make "Feed" in sidebar clickable (currently no onclick)
- [x] Improve UI for pages like Bookmarks.js, TrendingIdeas.js, SuggestedCollaborators.js (add CSS classes instead of inline styles)
- [x] Enhance basic pages like WeeklyStats.js and Reports.js with better content and styling
- [x] Ensure all right-panel links navigate properly and have good UI

## Phase 4: General UI Improvements
- [x] Add consistent styling across all updated pages
- [ ] Test all onclick functionalities
- [ ] Ensure no white pages remain

## Phase 5: Testing and Finalization
- [ ] Run the app and test all sidebar/topbar options
- [ ] Fix any remaining issues
- [ ] Update this TODO as tasks are completed

# TODO: Update PostIdea.js for Multiple Collaborators/Investors Selection

## Phase 1: Update Database Model
- [x] Modify server/models/Idea.js to change "lookingFor" from String to [String] (array of strings)

## Phase 2: Update Server Controller
- [x] Update server/controllers/ideaController.js to handle "lookingFor" as an array in createIdea function

## Phase 3: Update Frontend Component
- [x] Modify client/src/pages/PostIdea.js to replace the single select dropdown for "lookingFor" with checkboxes allowing multiple selections
- [x] Update state management to handle an array for "lookingFor"
- [x] Ensure the form submits the selected options as an array

## Phase 4: Testing
- [ ] Test posting an idea with multiple "lookingFor" selections
- [ ] Verify data is saved correctly in the database
- [ ] Check that the idea displays the multiple selections properly
