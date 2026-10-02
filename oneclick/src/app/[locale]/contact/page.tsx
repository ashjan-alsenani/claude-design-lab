import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ topic?: string; ref?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata({ locale, path: "/contact", title: d.contact.title, description: d.contact.sub });
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const d = getDictionary(locale);
  const topic = sp.topic && sp.topic in d.contact.topics ? sp.topic : undefined;
  return (
    <>
      <PageHeader title={d.contact.title} sub={d.contact.sub} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <ContactForm d={{ contact: d.contact, custom: d.custom, form: d.form }} locale={locale} defaultTopic={topic} defaultReference={sp.ref?.slice(0, 80)} />
      </div>
    </>
  );
}
