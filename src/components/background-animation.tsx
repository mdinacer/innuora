const BackgroundAnimation = () => {
  return (
    <>
      <div className="fixed hidden md:block inset-0 w-screen h-screen">
        <video
          autoPlay
          loop
          muted
          preload="auto"
          playsInline
          aria-hidden="true"
          className="object-cover w-full h-full  grayscale dark:grayscale-0 opacity-10 dark:opacity-20 dark:invert-0"
        >
          <source src="/assets/videos/hero2.webm" type="video/webm" />
          <source src="/assets/videos/hero2.mp4" type="video/mp4" />
          {/* <source src="/assets/videos/hero.webm" type="video/webm" />
          <source src="/assets/videos/hero.mp4" type="video/mp4" /> */}
          Your browser does not support the video tag.
        </video>
      </div>
      <div
        className="fixed inset-0 hidden md:block bg-[#0a1628]  dark:mix-blend-exclusion mix-blend-color  h-screen w-screen"
        style={{
          willChange: "transform, opacity", // Hint GPU for smooth compositing
        }}
      />
    </>
  );
};

export default BackgroundAnimation;
