import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <main className=" h-screen flex flex-col w-screen bg-[#f3f7fb] dark:bg-[#0b1120] sm:p-6">
      <div
        className={cn(
          "max-w-4xl w-full flex-1 sm:rounded-2xl mx-auto overflow-hidden relative",
          "bg-white dark:bg-[#0f172a]",
          "border border-[#e2e8f0] dark:border-[#1f2a44]",
          "flex flex-col"
        )}
      >
        <div
          className={cn(
            "absolute top-0 inset-x-0 z-10",
            "h-20 w-full bg-black/20 backdrop-blur-sm backdrop-saturate-150 ",
            "border-b border-b-[#e2e8f0] dark:border-b-[#1f2a44]"
          )}
        ></div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col gap-y-6 py-[20%]">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-lg self-start p-5 d-fle ",
                  "odd:bg-[#00659b]/5 dark:odd:bg-[#00659b]/5 odd:self-end bg-[#eef2f7] dark:bg-[#0f1a2b]",
                  "odd:border-[#00659b]/40 dark:odd:border-[#00659b]/40 odd:border rounded-2xl"
                )}
              >
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit facilis mollitia nisi eveniet
                exercitationem a nulla error eius at dolores.
              </div>
            ))}
          </div>
        </div>
        <div
          className={cn(
            "absolute bottom-0 inset-x-0 z-10",
            "h-20 w-full bg-black/20 backdrop-blur-sm backdrop-saturate-150 ",
            "border-t border-t-[#e2e8f0] dark:border-t-[#1f2a44]"
          )}
        ></div>
      </div>
    </main>
  );
}
