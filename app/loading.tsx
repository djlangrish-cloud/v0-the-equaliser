export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="flex items-end gap-0.5 h-8">
              {[3, 5, 7, 5, 3].map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-sm bg-primary"
                  style={{ height: `${h * 4}px` }}
                />
              ))}
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-3 tracking-tight text-balance">
            The <span className="text-primary">Equaliser</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto text-pretty">
            Free SEO audit tool. Analyse any website for technical SEO issues, meta tags,
            schema markup, social previews, and more.
          </p>
        </div>

        {/* Loading State */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-end gap-1 h-12 mb-6">
            {[3, 5, 7, 5, 3].map((h, i) => (
              <div
                key={i}
                className="w-3 rounded-sm bg-primary animate-pulse"
                style={{
                  height: `${h * 5}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <div className="text-lg font-medium text-foreground">Analysing website...</div>
          <div className="text-sm text-muted-foreground mt-1">
            Checking SEO, robots.txt, sitemap, social tags, and more
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            The Equaliser by{" "}
            <a
              href="https://www.rebelmarketer.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Rebel Marketer
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}
