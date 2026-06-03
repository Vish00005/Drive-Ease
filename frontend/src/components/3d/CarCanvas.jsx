export default function SketchfabEmbed() {
  return (
    <div className="w-full h-full relative" style={{ minHeight: "380px" }}>
      <iframe
        title="Honda Shadow RS 2010"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src="https://sketchfab.com/models/2e7cf7bc195044f4a0f60c04581e2691/embed?autospin=1&autostart=1&preload=1&transparent=1&ui_infos=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=0&ui_annotations=0&ui_stop=0&ui_ar=0&ui_vr=0"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "380px",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}
