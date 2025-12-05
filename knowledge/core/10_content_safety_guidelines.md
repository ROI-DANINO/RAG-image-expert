# Content Safety & NSFW Generation Guidelines

**Version:** v1.0
**Purpose:** Provide guidance on navigating SFW (Safe for Work) and NSFW (Not Safe for Work) content generation across different models.
**Last Updated:** 2025-12-04

---

## 1. Core Principle: Adhere to Terms of Service

All integrated models and services (Google Gemini, Fal.ai, Higgsfield, etc.) have their own **Terms of Service (ToS)** and **Acceptable Use Policies (AUP)**. These policies universally prohibit the generation of illegal content, such as child sexual abuse material (CSAM), and often have strict restrictions on other forms of explicit or harmful content.

> **Golden Rule:** The user is ultimately responsible for adhering to the ToS of the service they are using. This guide provides practical advice for navigating these policies, not for circumventing them.

--- 

## 2. Understanding the Spectrum of "NSFW"

"NSFW" is a broad term. For AI image generation, it can be broken down into several categories, each with different levels of restriction:

| Category | Description | General Model Tolerance |
| :--- | :--- | :--- |
| **Artistic Nudity** | Nude figures in a fine art context (e.g., classical statues, life drawings). | **Moderate.** Often permissible if framed with artistic keywords. |
| **Implied / Suggestive** | Content that is not explicit but is sensual or suggestive in nature. | **Varies.** Highly dependent on the model and specific prompt wording. |
| **Swimwear / Lingerie** | Depictions of people in swimwear or lingerie. | **Generally Permissible.** Usually considered SFW, but can be flagged if the context is overly sexualized. |
| **Graphic Violence** | Depictions of gore, extreme violence, or self-harm. | **Low to None.** Most models have strong filters against graphic violence. |
| **Explicit Sexual Content** | Depictions of sexual acts or explicit nudity in a non-artistic context. | **Strictly Prohibited.** This will almost always be blocked and may result in an account ban. |

--- 

## 3. Prompting Strategies for Borderline Content

When creating content that is on the edge of what's acceptable (e.g., artistic nudity, boudoir photography), the **framing of your prompt is critical.**

### The Power of Artistic Framing

Models are trained to recognize context. By using keywords associated with art, history, and professional photography, you can guide the model towards a permissible interpretation.

| Instead of This (Likely to be Blocked) | Try This (More Likely to Succeed) |
| :--- | :--- |
| `"nude woman"` | `"artistic nude figure study, chiaroscuro lighting, in the style of Rembrandt"` |
| `"woman in lingerie"` | `"boudoir photography, woman in silk robe, soft window light, intimate portrait"` |
| `"sexy pose"` | `"confident and powerful pose, fashion editorial style"` |
| `"bloody battle"` | `"epic battle scene, cinematic, dynamic action, stylized fantasy art"` |

**Key Takeaway:** Describe the **artistic style, lighting, and composition**, not just the subject. This provides the model with a non-explicit context.

### Keyword Bank for Safe Framing

- **Artistic Nudity:** `fine art`, `classical sculpture`, `life drawing`, `figure study`, `in the style of [artist]`, `chiaroscuro`, `sfumato`
- **Intimate/Suggestive:** `boudoir photography`, `intimate portrait`, `sensual`, `implied nudity`, `silhouette`, `shadows obscuring details`
- **Violence (Stylized):** `cinematic action scene`, `dynamic combat`, `fantasy battle`, `stylized`, `abstract representation of conflict`

--- 

## 4. Model-Specific Behavior (General Observations)

- **Google Gemini / Nano Banana Pro:** Tends to be more conservative and has strong safety filters. Artistic framing is essential.
- **Flux / Fal.ai:** Generally offers more flexibility, especially for artistic and suggestive themes. However, it is still subject to Fal.ai's AUP.
- **Stable Diffusion (General):** The most flexible, but the specific implementation and safety filters can vary widely by provider.

--- 

## 5. Disclaimer

This guide is for informational purposes only. The generation of NSFW content is subject to the terms of service of the respective AI model providers. Users are responsible for ensuring their use of these models is compliant with all applicable policies and laws. Attempting to circumvent safety filters can lead to warnings, suspensions, or permanent bans.
