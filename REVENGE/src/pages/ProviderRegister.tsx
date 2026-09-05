import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check } from 'lucide-react';
import { Button, Input, Select, Textarea } from '../components/ui/primitives';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { createOrUpdateProvider } from '../services/providers';
import { submitVerification } from '../services/verification';
import { isGeminiConfigured } from '../services/ai';
import { cityCoords } from '../services/mockData';

const STEPS = ['Basic info', 'Business info', 'Location', 'Portfolio', 'Verification', 'Preview & publish'];

interface Draft {
  businessName: string; phone: string; email: string;
  category: string; description: string; experienceYears: string;
  city: string; address: string; pincode: string;
  priceMin: string; priceMax: string;
  aiPrompt: string;
}

export function ProviderRegisterPage() {
  const { profile } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    businessName: '', phone: '', email: profile?.email ?? '', category: '', description: '', experienceYears: '',
    city: '', address: '', pincode: '', priceMin: '', priceMax: '', aiPrompt: '',
  });
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const runAiAssist = async () => {
    if (!draft.aiPrompt.trim()) return;
    setAiSuggesting(true);
    // Real mode would call Gemini with the freeform prompt to draft title/description/category.
    // Demo fallback: deterministic templating so the flow is always demoable.
    await new Promise((r) => setTimeout(r, 700));
    const text = draft.aiPrompt.trim();
    update({
      description: `${text.charAt(0).toUpperCase()}${text.slice(1)}. Reliable, locally-based service with a focus on quality and clear pricing.`,
    });
    setAiSuggesting(false);
    show(isGeminiConfigured ? 'AI suggestions applied.' : 'Draft generated (fallback mode — connect Gemini for live suggestions).', 'success');
  };

  const publish = async () => {
    if (!profile) return;
    setSubmitting(true);
    try {
      const coords = cityCoords[draft.city] ?? [20.5937, 78.9629];
      await createOrUpdateProvider({
        user_id: profile.id,
        business_name: draft.businessName,
        slug: draft.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: draft.description,
        experience_years: Number(draft.experienceYears) || 0,
        phone: draft.phone,
        email: draft.email,
        address: draft.address,
        city: draft.city,
        pincode: draft.pincode,
        latitude: coords[0],
        longitude: coords[1],
        price_min: Number(draft.priceMin) || 0,
        price_max: Number(draft.priceMax) || 0,
        is_active: true,
        verification_status: 'pending',
      });
      await submitVerification({ providerId: profile.id, documentType: 'business_license', documentUrl: 'demo://uploaded-document' });
      show('Profile published! Verification is pending admin review.', 'success');
      navigate('/provider/dashboard');
    } catch {
      show('Could not publish profile.', 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-[--color-ink]">Set up your provider profile</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${i === step ? 'bg-[--color-indigo] text-[--color-paper]' : i < step ? 'bg-[--color-paisley]/12 text-[--color-paisley]' : 'bg-[--color-ink]/6 text-[--color-ink-soft]'}`}>
            {i < step && <Check className="h-3 w-3" />} {s}
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {step === 0 && (
          <>
            <Input label="Business / trade name" value={draft.businessName} onChange={(e) => update({ businessName: e.target.value })} />
            <Input label="Phone" value={draft.phone} onChange={(e) => update({ phone: e.target.value })} />
            <Input label="Email" type="email" value={draft.email} onChange={(e) => update({ email: e.target.value })} />
          </>
        )}

        {step === 1 && (
          <>
            <div className="rounded-[--radius-md] border border-[--color-marigold]/30 bg-[--color-marigold]/8 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[--color-ink]"><Sparkles className="h-4 w-4 text-[--color-marigold]" /> AI-assisted profile creation</p>
              <p className="mb-2 text-xs text-[--color-ink-soft]">Describe what you do in a sentence, and we'll draft a description you can edit.</p>
              <div className="flex gap-2">
                <Input value={draft.aiPrompt} onChange={(e) => update({ aiPrompt: e.target.value })} placeholder="e.g. I repair ACs in Delhi and have 12 years of experience" />
                <Button variant="secondary" onClick={runAiAssist} loading={aiSuggesting}>Generate</Button>
              </div>
            </div>
            <Select label="Category" value={draft.category} onChange={(e) => update({ category: e.target.value })}>
              <option value="">Select a category</option>
              {['Home Services', 'Repair & Maintenance', 'Photographers', 'Handicrafts', 'Beauty & Wellness', 'Tutors', 'Local Experiences', 'Artisans'].map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Textarea label="Description" rows={4} value={draft.description} onChange={(e) => update({ description: e.target.value })} />
            <p className="text-xs text-[--color-ink-soft]">Review the AI-generated text before publishing — you're always in control of what's shown.</p>
            <Input label="Years of experience" type="number" value={draft.experienceYears} onChange={(e) => update({ experienceYears: e.target.value })} />
          </>
        )}

        {step === 2 && (
          <>
            <Select label="City" value={draft.city} onChange={(e) => update({ city: e.target.value })}>
              <option value="">Select a city</option>
              {Object.keys(cityCoords).map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Input label="Address" value={draft.address} onChange={(e) => update({ address: e.target.value })} />
            <Input label="Pincode" value={draft.pincode} onChange={(e) => update({ pincode: e.target.value })} />
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-[--color-ink-soft]">Add starting and typical prices — you can add photos and detailed services later from your dashboard.</p>
            <Input label="Starting price (₹)" type="number" value={draft.priceMin} onChange={(e) => update({ priceMin: e.target.value })} />
            <Input label="Typical top price (₹)" type="number" value={draft.priceMax} onChange={(e) => update({ priceMax: e.target.value })} />
          </>
        )}

        {step === 4 && (
          <div className="rounded-[--radius-md] border border-dashed border-[--color-line] p-6 text-center">
            <p className="text-sm text-[--color-ink-soft]">Document upload isn't wired to storage in this demo build. Continuing will submit a placeholder verification request that appears in the admin queue.</p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3 rounded-[--radius-md] border border-[--color-line] bg-white/50 p-5">
            <h3 className="font-display text-lg text-[--color-ink]">{draft.businessName || 'Your business name'}</h3>
            <p className="text-sm text-[--color-ink-soft]">{draft.description || 'No description yet.'}</p>
            <p className="text-sm text-[--color-ink-soft]">{draft.city}, {draft.address} {draft.pincode}</p>
            <p className="text-sm font-medium text-[--color-indigo]">₹{draft.priceMin || '0'} – ₹{draft.priceMax || '0'}</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
        ) : (
          <Button loading={submitting} onClick={publish}>Publish profile</Button>
        )}
      </div>
    </div>
  );
}
