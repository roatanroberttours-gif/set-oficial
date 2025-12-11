import React, { useEffect, useState } from "react";
import { Video, Play } from "lucide-react";
import { useSupabaseSet } from "../hooks/supabaseset";

type VideoData = {
  video1?: string | null;
  video2?: string | null;
};

const VideosSection: React.FC = () => {
  const client = useSupabaseSet();
  const [videos, setVideos] = useState<VideoData>({
    video1: null,
    video2: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await client
        .from("videos")
        .select("*")
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      if (data) {
        setVideos({
          video1: data.video1 || null,
          video2: data.video2 || null,
        });
      }
    } catch (err) {
      console.error("Error loading videos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter out null videos
  const activeVideos = [videos.video1, videos.video2].filter(
    Boolean
  ) as string[];

  // Don't render if no videos
  if (loading || activeVideos.length === 0) return null;

  return (
    <section className="py-16 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Experience Our Tours
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Watch our adventure videos and get a glimpse of the amazing
            experiences waiting for you
          </p>
        </div>

        {/* Videos Grid */}
        <div
          className={`grid grid-cols-1 ${
            activeVideos.length > 1 ? "md:grid-cols-2" : ""
          } gap-8 max-w-6xl mx-auto`}
        >
          {activeVideos.map((videoUrl, index) => (
            <div
              key={index}
              className="group relative bg-transparent backdrop-blur-sm rounded-2xl shadow-none overflow-hidden hover:shadow-none transition-all duration-300 transform hover:-translate-y-0"
            >
              <div className="relative">
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full object-cover rounded-t-2xl bg-transparent"
                  style={{ maxHeight: "400px", backgroundColor: "transparent" }}
                  poster=""
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-t-2xl"></div>
              </div>
              <div className="p-6 bg-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-100">
                    <Play className="w-5 h-5 mr-2 text-orange-300" />
                    <span className="font-semibold text-white">
                      Tour Video {index + 1}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-orange-600/80 text-white rounded-full text-sm font-semibold">
                    Watch Now
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideosSection;
