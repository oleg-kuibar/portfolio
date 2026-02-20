import { ConvexClientProvider } from '../ConvexClientProvider';
import { useThemeColors } from '../useThemeColors';
import { HeroSection } from './HeroSection';
import { InstallSection } from './InstallSection';
import { FirstCascadeSection } from './FirstCascadeSection';
import { DryRunSection } from './DryRunSection';
import { SoftDeleteSection } from './SoftDeleteSection';
import { ScaleSection } from './ScaleSection';
import { AuditSection } from './AuditSection';
import { GetStartedSection } from './GetStartedSection';

export function CascadeDemoPage() {
  const colors = useThemeColors();

  if (!colors) return null;

  return (
    <div>
      {/* Section 1: Hero — The Problem */}
      <HeroSection />

      {/* Section 2: Install & Configure */}
      <InstallSection />

      <ConvexClientProvider>
        {/* Section 3: Your First Cascade Delete (live) */}
        <FirstCascadeSection />

        {/* Section 4: Preview Before You Delete (live) */}
        <DryRunSection />

        {/* Section 5: Soft-Delete & Restore (simulated) */}
        <SoftDeleteSection />

        {/* Section 6: At Scale (live) */}
        <ScaleSection />
      </ConvexClientProvider>

      {/* Section 7: Audit Everything */}
      <AuditSection />

      {/* Section 8: Get Started */}
      <GetStartedSection />
    </div>
  );
}
