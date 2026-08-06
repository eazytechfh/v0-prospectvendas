import Image from "next/image"

export function ProspectLogo() {
  return (
    <a
      href="https://www.prospectvendas.com.br"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center"
    >
      <Image
        src="/logo-prospect-vendas.png"
        alt="Prospect Vendas — Mentorias, Sistemas e Treinamentos"
        width={2170}
        height={725}
        className="h-14 w-auto object-contain sm:h-16"
      />
    </a>
  )
}
