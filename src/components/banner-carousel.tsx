import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listActiveBanners } from "@/lib/banners.functions";
import { Skeleton } from "@/components/ui/skeleton";

type Banner = {
  id: string;
  image_url: string;
  title: string;
  description: string | null;
  target_link: string | null;
};

export function BannerCarousel() {
  const fn = useServerFn(listActiveBanners);
  const { data, isLoading } = useQuery({
    queryKey: ["banners", "active"],
    queryFn: () => fn(),
    staleTime: 60_000,
  });
  const banners: Banner[] = (data?.banners as any) ?? [];

  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })],
  );
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
    return () => { embla.off("select", onSelect); };
  }, [embla]);

  if (isLoading) {
    return (
      <div className="px-5 pt-6">
        <Skeleton className="h-36 w-full rounded-[20px]" />
      </div>
    );
  }
  if (!banners.length) return null;

  function onClick(b: Banner) {
    if (!b.target_link) return;
    if (b.target_link.startsWith("http")) window.open(b.target_link, "_blank", "noopener,noreferrer");
    else window.location.href = b.target_link;
  }

  return (
    <section className="pt-6">
      <div className="px-5 mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold">Promotions</h2>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((b) => (
            <div key={b.id} className="min-w-0 shrink-0 grow-0 basis-[88%] pl-5 last:pr-5">
              <button
                onClick={() => onClick(b)}
                className="group relative block h-36 w-full overflow-hidden rounded-[20px] bg-gradient-card text-left shadow-elegant"
              >
                <img
                  src={b.image_url}
                  alt={b.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-sm font-bold drop-shadow">{b.title}</p>
                  {b.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs opacity-90">{b.description}</p>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
      {banners.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => embla?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === selected ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/40"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
