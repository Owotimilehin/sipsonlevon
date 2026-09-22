import { MotionCheck } from "./MotionCheck";

export const metadata = {
  title: "Motion check",
  robots: { index: false, follow: false },
};

/** Diagnostic: reports what this browser is actually doing with motion. */
export default function MotionCheckPage() {
  return <MotionCheck />;
}
