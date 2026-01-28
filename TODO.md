# TODO: Implement State Management for Login Persistence and Data Fetching

## Objective
Ensure that logged-in users remain authenticated after page refresh, and pages fetch data appropriately without logging out.

## Information Gathered
- **AuthContext.js**: Uses Firebase `onAuthStateChanged` to manage user state, which should persist across refreshes.
- **firebase.js**: Configured with `browserLocalPersistence` for auth persistence.
- **ProtectedRoute.js**: Waits for auth loading and checks user profile before rendering protected pages.
- **Dashboard.js**: Fetches ideas on component mount, but does not check if user is authenticated before fetching.
- Other pages (e.g., Bookmarks, Activity) likely have similar data fetching patterns.

## Plan
1. **Update AuthContext**: Ensure loading state is properly handled and user data is available immediately on refresh.
2. **Modify Data Fetching in Pages**: Update pages to fetch data only when `currentUser` is available from `useAuth`.
3. **Add Loading States**: Implement loading indicators in pages while auth is loading or data is fetching.
4. **Ensure API Calls Include Auth**: Verify that all API services use the user's ID token for authenticated requests.
5. **Test Refresh Behavior**: Manually test login persistence and data fetching after refresh.

## Dependent Files to Edit
- `client/src/context/AuthContext.js` (minor updates if needed)
- `client/src/pages/Dashboard.js`
- `client/src/pages/Bookmarks.js`
- `client/src/pages/Activity.js`
- `client/src/pages/TrendingIdeas.js`
- `client/src/pages/Members.js`
- `client/src/pages/WeeklyStats.js`
- `client/src/pages/SuggestedCollaborators.js`
- `client/src/pages/Settings.js`
- `client/src/pages/Reports.js`
- `client/src/services/ideaService.js`
- `client/src/services/bookmarkService.js`
- `client/src/services/activityService.js`
- `client/src/services/userService.js`

## Followup Steps
- Run the app and test login/refresh cycle.
- Check browser console for any auth or API errors.
- If issues persist, investigate Firebase configuration or token expiration.
