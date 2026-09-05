import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { ProviderProfile, Category, Experience, Review } from '../../types';
import { Rating, VerificationBadge } from '../badges/Badges';
import { PlaceholderImage } from '../ui/PlaceholderImage';

export function ProviderCard({ provider, distanceKm }: { provider: ProviderProfile; distanceKm?: number | null }) {
  return (
    <Link
      to={`/provider/${provider.slug}`}
      className="group block overflow-hidden rounded-[--radius-lg] border border-[--color-line] bg-white/70 transition-shadow hover:shadow-lg"
    >
      <PlaceholderImage seed={provider.cover_image ?? provider.id} className="h-36 w-full" />
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-display text-base leading-tight text-[--color-ink]">{provider.business_name}</h3>
          <VerificationBadge verified={provider.is_verified} />
        </div>
        <p className="mb-2 line-clamp-2 text-sm text-[--color-ink-soft]">{provider.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[--color-ink-soft]">
          <Rating value={provider.rating_avg} count={provider.rating_count} />
          <span className="inline-flex items-center gap-1">
            <Icons.MapPin className="h-3.5 w-3.5" /> {provider.city}
            {distanceKm != null && ` · ${distanceKm.toFixed(1)} km`}
          </span>
        </div>
        <div className="mt-3 text-sm font-medium text-[--color-indigo]">From ₹{provider.price_min.toLocaleString('en-IN')}</div>
      </div>
    </Link>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  const Icon = (Icons as any)[category.icon] ?? Icons.Sparkles;
  return (
    <Link
      to={`/category/${category.slug}`}
      className="flex flex-col items-center gap-2.5 rounded-[--radius-md] border border-[--color-line] bg-white/60 px-4 py-5 text-center transition-colors hover:border-[--color-indigo]/40 hover:bg-white"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[--color-marigold]/15 text-[--color-marigold]">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium text-[--color-ink]">{category.name}</span>
    </Link>
  );
}

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link
      to={`/experience/${experience.id}`}
      className="group block overflow-hidden rounded-[--radius-lg] border border-[--color-line] bg-white/70 transition-shadow hover:shadow-lg"
    >
      <PlaceholderImage seed={experience.cover_image} className="h-40 w-full" />
      <div className="p-4">
        <h3 className="font-display text-base leading-tight text-[--color-ink]">{experience.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-[--color-ink-soft]">{experience.description}</p>
        <div className="mt-2.5 flex items-center gap-3 text-xs text-[--color-ink-soft]">
          <Rating value={experience.rating_avg} count={experience.rating_count} />
          <span className="inline-flex items-center gap-1"><Icons.MapPin className="h-3.5 w-3.5" /> {experience.city}</span>
          <span className="inline-flex items-center gap-1"><Icons.Clock className="h-3.5 w-3.5" /> {experience.duration}</span>
        </div>
        <div className="mt-3 text-sm font-medium text-[--color-indigo]">₹{experience.price.toLocaleString('en-IN')} · up to {experience.max_people}</div>
      </div>
    </Link>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-[--radius-md] border border-[--color-line] bg-white/60 p-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-[--color-ink]">{review.customer_name ?? 'Customer'}</span>
        <Rating value={review.rating} />
      </div>
      <p className="text-sm text-[--color-ink-soft]">{review.review_text}</p>
      <p className="mt-2 text-xs text-[--color-ink]/40">{new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
    </div>
  );
}
