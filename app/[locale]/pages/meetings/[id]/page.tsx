import ProtectedLayout from "@/components/layouts/ProtectedLayout"
import MinuteDetailPage from "@/components/meetings/minute-detail/meeting-detail"


export default async function MinuteDetail({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <MinuteDetailPage minuteId={id} locale={locale} />
        </div>
      </div>
    </ProtectedLayout>
  )
}
