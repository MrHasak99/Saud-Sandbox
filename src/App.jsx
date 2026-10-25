import Storefront from "./pages/Storefront";

// FreshKWT is the only screen in the app now. The old AI Micro-Lab pages
// still exist under src/pages/Lab.jsx and src/components/ but are no longer
// linked from the UI, so they're left alone rather than deleted.
export default function App() {
  return <Storefront />;
}
