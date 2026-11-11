import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { IMG } from "@/data/products";

interface Crumb {
  href?: string;
  label: string;
}

export function PageHeader({
  title,
  eyebrow,
  description,
  crumbs = [],
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="relative overflow-hidden pb-12 pt-32 md:pb-16 md:pt-40">
      <Image src={IMG.heroDesert} alt="" fill priority sizes="100vw" className="object-cover object-[50%_60%] opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-cream/70 via-cream/80 to-cream" />
      <div className="container-lux relative">
        <nav aria-label="Fil d'Ariane" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <li>
              <Link href="/" className="hover:text-forest">
                Accueil
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="size-3" />
                {c.href ? (
                  <Link href={c.href} className="hover:text-forest">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-forest">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] text-forest md:text-6xl">{title}</h1>
        {description && <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink/70">{description}</p>}
      </div>
    </section>
  );
}
