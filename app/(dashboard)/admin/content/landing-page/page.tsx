import Link from 'next/link'
import { auth } from '@/lib/auth'
import {
  getHeroContent,
  getFeaturesContent,
  getStepsContent,
  getPricingIntro,
  getTestimonialsHeader,
  getFooterContent,
} from '@/lib/cms'
import { HeroContentForm } from '@/components/admin/HeroContentForm'
import { FeaturesContentForm } from '@/components/admin/FeaturesContentForm'
import { StepsContentForm } from '@/components/admin/StepsContentForm'
import { PricingIntroForm } from '@/components/admin/PricingIntroForm'
import { TestimonialsHeaderForm } from '@/components/admin/TestimonialsHeaderForm'
import { FooterContentForm } from '@/components/admin/FooterContentForm'
import { isDemoUser } from '@/lib/demo'

export default async function AdminLandingPageContentPage() {
  const session = await auth()
  const [hero, features, steps, pricingIntro, testimonialsHeader, footer] = await Promise.all([
    getHeroContent(),
    getFeaturesContent(),
    getStepsContent(),
    getPricingIntro(),
    getTestimonialsHeader(),
    getFooterContent(),
  ])

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Landing page</h1>
        <Link href="/" target="_blank" className="text-sm font-semibold text-primary hover:text-violet-800">
          Ver ao vivo
        </Link>
      </div>
      <p className="mt-2 text-muted-foreground">Edite todo o conteúdo mostrado na página inicial pública.</p>

      {isDemoUser(session!.user.id) && (
        <p className="mt-4 rounded-lg bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
          Modo demo: os valores abaixo são os que estão publicados agora, mas guardar exige um banco real.
        </p>
      )}

      <div className="mt-8 space-y-10">
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Hero (topo da página)</h2>
          <HeroContentForm eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} statText={hero.statText} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Método (&quot;Por que Next Level?&quot;)</h2>
          <FeaturesContentForm
            eyebrow={features.eyebrow}
            headingMain={features.headingMain}
            headingHighlight={features.headingHighlight}
            paragraph={features.paragraph}
            calloutTitle={features.calloutTitle}
            calloutText={features.calloutText}
            items={features.items}
          />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Como funciona</h2>
          <StepsContentForm eyebrow={steps.eyebrow} heading={steps.heading} items={steps.items} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Planos (texto de introdução)</h2>
          <PricingIntroForm eyebrow={pricingIntro.eyebrow} heading={pricingIntro.heading} subtitle={pricingIntro.subtitle} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Depoimentos (cabeçalho)</h2>
          <TestimonialsHeaderForm
            eyebrow={testimonialsHeader.eyebrow}
            heading={testimonialsHeader.heading}
            ratingText={testimonialsHeader.ratingText}
          />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Rodapé</h2>
          <FooterContentForm copyrightText={footer.copyrightText} />
        </section>
      </div>
    </div>
  )
}
