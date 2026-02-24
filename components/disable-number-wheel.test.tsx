import { render } from "@testing-library/react"
import DisableNumberWheel from "@/components/disable-number-wheel"

describe("DisableNumberWheel", () => {
  it("blurs focused number input on wheel", () => {
    render(
      <>
        <DisableNumberWheel />
        <input type="number" data-testid="n" />
      </>
    )

    const input = document.querySelector('[data-testid="n"]') as HTMLInputElement
    input.focus()
    expect(document.activeElement).toBe(input)

    input.dispatchEvent(new WheelEvent("wheel", { bubbles: true }))
    expect(document.activeElement).not.toBe(input)
  })

  it("does not affect focused text input", () => {
    render(
      <>
        <DisableNumberWheel />
        <input type="text" data-testid="t" />
      </>
    )

    const input = document.querySelector('[data-testid="t"]') as HTMLInputElement
    input.focus()
    input.dispatchEvent(new WheelEvent("wheel", { bubbles: true }))

    expect(document.activeElement).toBe(input)
  })
})
