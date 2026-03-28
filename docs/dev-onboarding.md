# Adding a New Mechanic

To extend the developer onboarding system with new mechanics, follow this workflow:

1. **Implement feature**: Write your core logic (e.g., in `src/store/` or `src/systems/`).
2. **Setup Blueprint**: If the mechanic has configurable constants (like distance or rates), add them to `src/docs/blueprint.ts`.
3. **Add entry to `mechanics_manifest.ts`**: Register your mechanic in the appropriate era or the `global` category.
   - **ID**: Unique string (used for triggering focus).
   - **Title**: Human-readable name.
   - **File**: Path to the main logic file.
   - **Summary**: Brief explanation (use template literals from `BLUEPRINT` to avoid drift).
4. **Wire up Context Highlighting**:
   - Use `setDevFocus(['your_mechanic_id'])` on hover or interaction in your components.
   - Call `setDevFocus([])` to clear the focus.

The onboarding system will auto-detect and display your new mechanic when it is in focus and `isDevOnboardingActive` is enabled.
