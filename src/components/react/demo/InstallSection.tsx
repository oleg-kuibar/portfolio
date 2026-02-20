import { useThemeColors } from '../useThemeColors';
import { SectionHeader } from './SectionHeader';
import { CodeBlock } from './CodeBlock';

const STEP_1 = `npm install @convex-dev/cascading-deletes`;

const STEP_2 = `// convex/convex.config.ts
import { defineApp } from "convex/server";
import cascadingDeletes from "@convex-dev/cascading-deletes/convex.config";

const app = defineApp();
app.use(cascadingDeletes);
export default app;`;

const STEP_3 = `// convex/functions.ts
import { CascadingDeletes } from "@convex-dev/cascading-deletes";
import { components } from "./_generated/api";

const cascade = new CascadingDeletes(components.cascadingDeletes, {
  relationships: [
    {
      name: "user_posts",
      sourceTable: "users",
      targetTable: "posts",
      targetIndex: "by_userId",
      targetIndexFields: ["userId"],
    },
    {
      name: "post_comments",
      sourceTable: "posts",
      targetTable: "comments",
      targetIndex: "by_postId",
      targetIndexFields: ["postId"],
    },
  ],
});`;

export function InstallSection() {
  const colors = useThemeColors();
  if (!colors) return null;

  const { foreground: fg, mutedFg, border, primary } = colors;

  const stepLabelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: primary,
    marginBottom: '0.4rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  };

  const stepNumStyle: React.CSSProperties = {
    width: 20, height: 20, borderRadius: '50%',
    border: `2px solid ${primary}`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.6rem', fontWeight: 700, color: primary, flexShrink: 0,
  };

  return (
    <section style={{ marginBottom: '4rem' }}>
      <SectionHeader
        title="Install & Configure"
        subtitle="Three lines of setup. Declare your relationships once, and the component handles the rest."
        id="install"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Step 1 */}
        <div>
          <div style={stepLabelStyle}>
            <span style={stepNumStyle}>1</span>
            Install the component
          </div>
          <CodeBlock code={STEP_1} language="bash" title="terminal" />
        </div>

        {/* Step 2 */}
        <div>
          <div style={stepLabelStyle}>
            <span style={stepNumStyle}>2</span>
            Register in your app config
          </div>
          <CodeBlock code={STEP_2} language="typescript" title="convex.config.ts" />
        </div>

        {/* Step 3 */}
        <div>
          <div style={stepLabelStyle}>
            <span style={stepNumStyle}>3</span>
            Declare your relationships
          </div>
          <CodeBlock code={STEP_3} language="typescript" title="functions.ts" />
        </div>
      </div>

      <div style={{
        marginTop: '1rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        color: mutedFg,
        lineHeight: 1.6,
        maxWidth: '36rem',
      }}>
        Each relationship maps a parent table to a child table via an index. The component uses these to discover all descendants when you delete a parent.
      </div>
    </section>
  );
}
