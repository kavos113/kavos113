import satori from "satori";
import { LanguageStat } from "./main";
import fs from "fs/promises";

const LangInfo = (
  lang: {
    name: string;
    percentage: string;
    color: string | null;
  },
) => {
  return (
    <div key={lang.name} style={{
      display: "flex",
      alignItems: "center",
    }}>
      <div style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: lang.color || "#000000",
        marginRight: "8px",
      }} />
      <span style={{
        fontWeight: 600,
        marginRight: "6px",
        fontSize: "14px",
      }}>
        {lang.name}
      </span>
      <span style={{
        color: "#8b949e",
        fontSize: "14px",
      }}>
        {lang.percentage}%
      </span>
    </div>
  )
}

const LangStats = (
  stats: {
    name: string;
    percentage: string;
    color: string | null;
  }[],
  width = 600,
) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: `${width}px`,
      padding: '20px',
      border: '1px solid #e1e4e8',
      borderRadius: '6px',
      backgroundColor: '#fefefe',
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '20px',
        fontWeight: 600,
      }}>
        Top Languages
      </h3>

      <div style={{
        display: "flex",
        width: "100%",
        height: "12px",
        borderRadius: "6px",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
      }}>
        {stats.map((lang, index) => {
          const borderRight = index < stats.length - 1 ? '1px solid #ffffff' : 'none';

          return (
            <div 
              key={lang.name}
              style={{
                flex: lang.percentage,
                backgroundColor: lang.color || "#000000",
                borderRight: borderRight,
                boxSizing: "border-box",
              }}
            />
          )
        })}
      </div>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "24px",
        marginTop: "16px",
        fontSize: "14px",
      }}>
        {stats.map((lang) => LangInfo(lang))}
      </div>
    </div>
  )
}

export const generateStats = async (
  stats: Record<string, LanguageStat>,
  outPath: string
): Promise<void> => {
  const totalSize = Object.values(stats).reduce(
    (acc, stat) => acc + stat.size,
    0,
  );

  const printStats = Object.values(stats)
    .sort((a, b) => b.size - a.size)
    .map(
      (stat) => {
        const percentage = ((stat.size / totalSize) * 100) >= 10
          ? ((stat.size / totalSize) * 100).toFixed(1)
          : ((stat.size / totalSize) * 100).toFixed(2);
        return {
          name: stat.name,
          percentage: percentage,
          color: stat.color,
        }
      }
    )
    .slice(0, 12);

  const svg = await satori(
    LangStats(printStats, 600),
    {
      width: 600,
      fonts: [
        {
          name: "Roboto",
          data: await fs.readFile("./fonts/Roboto-Regular.ttf"),
          weight: 400,
          style: "normal",
        },
        {
          name: "Roboto",
          data: await fs.readFile("./fonts/Roboto-Bold.ttf"),
          weight: 600,
          style: "normal",
        }
      ],
    }
  );

  await fs.writeFile(outPath, svg);
};