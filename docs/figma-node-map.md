# Figma Node Map

**File:** `KHFOMM4oUyT9XgeeXpbzns` — Databricks UI starter kit  
**Generated:** 2026-04-07 (re-run the discovery script below to refresh)

Use this file to look up component keys, variant node IDs, variable keys, and text style keys before writing any `use_figma` Plugin API code. Always use `importComponentByKeyAsync` / `importVariableByKeyAsync` / `importStyleByKeyAsync` — never hardcode values.

---

## Discovery script (re-run to refresh)

```js
const allComponents = figma.root.children.flatMap(p =>
  p.findAll(n => n.type === "COMPONENT" || n.type === "COMPONENT_SET")
);
return allComponents.map(n => ({ name: n.name, id: n.id, key: n.key, page: n.parent?.name }));
```

---

## UI Components

### Alert — `28:2` (COMPONENT_SET, 4 variants)
| Variant | Node ID | Key |
|---|---|---|
| Variant=info | 27:2 | `b88186a444b3470daa4c845b63d02846d2eb52b4` |
| Variant=destructive | 27:12 | `25cf6091d2cffdaeaba626366c8b0c948ffd2593` |
| Variant=warning | 27:17 | `010f721c168fb2720c8ff0776431563aaaf37725` |
| Variant=success | 27:22 | `8068a40d1bf2a95af8e386936c0a8ea09ad867f7` |

### Avatar — `404:28` (COMPONENT_SET, 9 variants)
| Variant | Node ID | Key |
|---|---|---|
| Size=sm, Type=image | 404:4 | `53ac2aa23f42057d6ab1bf5d88f945f5b997fa33` |
| Size=sm, Type=initials | 404:7 | `fc5a8458d50e9a31cf325278440c33c2cdb85206` |
| Size=sm, Type=icon | 404:9 | `b84fe47b985a79031a654ee6c5965f36905cfe05` |
| Size=md, Type=image | 404:12 | `a5424e824de8f371bb2629a531eaf9e732ed6c67` |
| Size=md, Type=initials | 404:15 | `9e112e2f527eaf377981e7d7fb3ae97b68c16a9b` |
| Size=md, Type=icon | 404:17 | `4fb60db0847a2e83d1b9ad5df95d07f4f832397b` |
| Size=lg, Type=image | 404:20 | `934b5c372547d88576f0d4384f89a40e7c8ff8e9` |
| Size=lg, Type=initials | 404:23 | `b7af0dbcb467b9c115ed37914901d52d1f6fb4ba` |
| Size=lg, Type=icon | 404:25 | `08ebc8057d9569fcff6ecc4c9806c440b90a6614` |

### Badge — `26:2` (COMPONENT_SET, 13 variants)
> **Note:** `Variant=outline` exists in Figma but is **not connected** in code — `outline` was removed from `badgeVariants`. Do not use it. Use `default_tag` or a named color variant instead.

| Variant | Node ID | Key |
|---|---|---|
| Variant=default | 25:2 | `45bc59f26401460769c4e74a2eff3546bc5c4c1c` |
| Variant=secondary | 25:4 | `fdc6f9605181ffc879ddd8895e9883fa183652ac` |
| Variant=destructive | 25:6 | `92339e6ac02001e35d779a6da94b9880e8f0de97` |
| ~~Variant=outline~~ | 25:8 | _(not used in code — removed)_ |
| Variant=coral | 25:10 | `fbfaa74466d3ece318b3ef54c676394d881adb91` |
| Variant=brown | 25:12 | `3626007ba335a9cfc4163dad2fb19b2e9bd67177` |
| Variant=indigo | 25:14 | `176bd201a80cdf19c2f9240fc02369e2a4141ea8` |
| Variant=lemon | 25:16 | `c855887a25e68990d3e63499ecb8d6cfff8f658a` |
| Variant=lime | 25:18 | `be09a9083253a7025882e1eecb58f008a6cf3446` |
| Variant=pink | 25:20 | `cbcd15e3e294ed0ed01f5cbb660918deebb7c90b` |
| Variant=purple | 25:22 | `8be20e3b2e4979bc767455899f5b3d082204a4e2` |
| Variant=teal | 25:24 | `95186d8a0f342adc570e541e8c032a3233735526` |
| Variant=turquoise | 25:26 | `0441e922ad406173cc993bcfbe5631da8a0ce1c7` |

### Breadcrumb — `408:4` (COMPONENT)
Key: `23dbced9ce8b6711e78670e7e8841e8f51bc0f5e`

### Button — `22:2` (COMPONENT_SET, 20 variants)
> **Note:** Figma variant names are `primary` (filled blue), `default` (bordered), `ghost`, `destructive`, `link`. Old names `outline` and `secondary` were removed. The node IDs below use the current DuBois names — re-run the discovery script to get exact keys after any Figma rename.

| Variant | Node ID | Key |
|---|---|---|
| Variant=primary, Size=sm | 21:2 | `b56a945f378b71524d2caf03e6689fe702fa3f5f` |
| Variant=default, Size=sm | 21:4 | `82a0b4ee3b38fd1ceb3422a39e52d2b4f30c0612` |
| Variant=ghost, Size=sm | 21:6 | `17e45dbbe09e72396230761d490300d408c53aac` |
| Variant=destructive, Size=sm | 21:8 | `e3eeebe9b8ac9d809345ea92d46acd00541a3316` |
| Variant=link, Size=sm | 21:12 | `46bfb1784fb20703cdccc2e9635265443bd8ebf8` |
| Variant=primary, Size=xs | 21:14 | `3eae3fca5ba45e108f16cd872ca9d3f204b9d0de` |
| Variant=default, Size=xs | 21:16 | `a926d5d6e5ac42b363d1a4130780c76172db4d4c` |
| Variant=ghost, Size=xs | 21:18 | `f8ab83f0ed0b94b00f09a93aa87b4cb503d81676` |
| Variant=destructive, Size=xs | 21:20 | `2d87865cb9d45320600769f4a6afa33d166dd0aa` |
| Variant=link, Size=xs | 21:24 | `341500bd2d0fae7f1371b26fc77a74a82ec3ad63` |
| Variant=primary, Size=icon-sm | 576:2 | `a03f7de52ef7324a46207de69cc52dae6c5677d9` |
| Variant=default, Size=icon-sm | 576:5 | `f4fafbfb564113d0f77dddc94978173dc09ec6c7` |
| Variant=ghost, Size=icon-sm | 576:8 | `a5a1dd3b1a20014c772a4b5a8a390605dca03c90` |
| Variant=destructive, Size=icon-sm | 576:11 | `f8f6733dde20b874549df6e4d3a7e60f56e5b871` |
| Variant=link, Size=icon-sm | 576:17 | `a67c687b1ad7f0b8d2f1878590ab0243f332bf34` |
| Variant=primary, Size=icon-xs | 1250:15 | `cedeb3d4a38f26e4e226c09da477798530073550` |
| Variant=default, Size=icon-xs | 1250:17 | `f35ef03ff29243fd3846e7b404649d4269d52fa9` |
| Variant=ghost, Size=icon-xs | 1250:19 | `8492689149c0486621b388ed3ab35d06d6731ce0` |
| Variant=destructive, Size=icon-xs | 1250:21 | `98037ae5393877568290cf14e5e0f5cc0477a4ca` |
| Variant=link, Size=icon-xs | 1250:25 | `f553e70efa0f0806432a7b7cabd1c561b05329fa` |

### Card — `566:22` (COMPONENT_SET, 2 variants)
| Variant | Node ID | Key |
|---|---|---|
| Type=default | 566:8 | `bedae6c0fb8d92bfad451ed7e1a4ba8a8fa7cbd3` |
| Type=header-only | 566:16 | `3288f39ddec2e33000d2cb7f65cb505e06140e5b` |

### Checkbox — `393:16` (COMPONENT_SET, 6 variants)
| Variant | Node ID | Key |
|---|---|---|
| State=unchecked, Disabled=false | 393:4 | `e35754b77251c05b8ffd9528cd3a7a08e11770c9` |
| State=unchecked, Disabled=true | 393:5 | `39e7a28d9de903a7fb8d3b74a14096984eab5305` |
| State=checked, Disabled=false | 393:6 | `594fe7d230886b25dcf1bcda76f3cc014f753bfb` |
| State=checked, Disabled=true | 393:9 | `b44be386a2799141cce5f5242d384837af734844` |
| State=indeterminate, Disabled=false | 393:12 | `bb520f7bb49351d54fc14b8bee77fd61774aae54` |
| State=indeterminate, Disabled=true | 393:14 | `80db9535d77bd0bdad0464ec2a749c3c9b5395a2` |

### Dialog — `668:52` (COMPONENT_SET, 2 variants)
| Variant | Node ID | Key |
|---|---|---|
| Type=default | 668:29 | `ad184a99523d0af35b20061a6a73238c87174440` |
| Type=no-footer | 668:43 | `ebed03c222da1bc1303cd389c088d0f579433ff3` |

### DropdownMenu — `626:30` (COMPONENT_SET, 2 variants)
| Variant | Node ID | Key |
|---|---|---|
| State=open | 626:2 | `e740b6300420568b90a8d772b84647783fc65bbb` |
| State=closed | 626:27 | `3e4e34c842ba146c85344513b4906b7c38af0b26` |

### Input — `30:2` (COMPONENT_SET, 4 variants)
| Variant | Node ID | Key |
|---|---|---|
| State=default | 29:2 | `2d8add73f0b787a7f327c5e452bf81297b8770fd` |
| State=focus | 29:4 | `8748545e9ad71737125b9d9b0bca5ace35b669c7` |
| State=error | 29:6 | `7499cfb3fa414658c329981c99eb1e3b41a5983f` |
| State=disabled | 29:8 | `ffab428aa203fc56d19447bcd32710cead9faee8` |

### Label — `554:7` (COMPONENT_SET, 2 variants)
| Variant | Node ID | Key |
|---|---|---|
| State=default | 554:3 | `2ec577136e8c28d9ee766f2bb143e39e51d6fb8c` |
| State=disabled | 554:5 | `5535358ecc62b657c7befd44ca7f4ebd4755a862` |

### ListItem — `803:10` (COMPONENT_SET, 2 variants)
| Variant | Node ID | Key |
|---|---|---|
| State=Default | 803:2 | `9eccf00068c91b48680db7ac1a99939fc98a11c7` |
| State=Selected | 803:6 | `fe76c638f617e1ead7200373ff0825ff72d97133` |

### Progress — `390:11` (COMPONENT_SET, 5 variants)
Keys: Value=0% `9150b44a8d8217c9d273c16d1f5b3e3540664b72` · 25% `796919595dd306b371830f2576fe71f2bdeee7a3` · 50% `499496769ef4486472e90c9aadf76e86ee451633` · 75% `5bd4bcd3faa288530fcb17cb208677ed13d453bc` · 100% `3afb2a7e02c344fc78621bd6b4657498b2033158`

### Radio — `387:8` (COMPONENT_SET, 4 variants)
| Variant | Node ID | Key |
|---|---|---|
| Checked=false, Disabled=false | 387:2 | `049a7a9c9f07de7e82678c2dd9b9639e8e1feb5b` |
| Checked=false, Disabled=true | 387:3 | `88bf3e7ae8320f71c7a92322f68be0a3ca778d18` |
| Checked=true, Disabled=false | 387:4 | `e1a064e5779515da062575ed01203a4a692563e9` |
| Checked=true, Disabled=true | 387:6 | `2d08607b16aaf71edd466c30a055c79a115559cc` |

### SegmentedItem — `802:14` (COMPONENT_SET, 6 variants)
Set key: `d3097c81a684e45c4ab166bfd16061c8982b2909`  
Individual keys: First/Default `0695fe418caeaca44cdfb96442a0caea95edafcd` · Middle/Default `5d686d37ae56317337189a69369e59549507f364` · Last/Default `b77d8cd543dd704496c52f1cc13d88ef157776b3` · First/Active `(get from set)` · Middle/Active · Last/Active

### Select — `31:2` (COMPONENT_SET) — Key: `(search_design_system "Select")`

### Sheet — `563:19` (COMPONENT_SET) — Key: `(search_design_system "Sheet")`

### Switch — `389:10` (COMPONENT_SET) — Key: `(search_design_system "Switch")`

### Tooltip — `553:10` (COMPONENT_SET) — Key: `(search_design_system "Tooltip")`

---

## Table Components

### Table — `573:66` (COMPONENT_SET, 2 variants)
| Variant | Key |
|---|---|
| State=default | `8ae23a3ffcaa2ec71a07e6f1f9e98b4c87454a47` |
| State=row-hover | `037a0a96affe44b7e9edff46b34a1eac11ec690b` |

### TableCell — `1289:5` (COMPONENT)
Key: `b87f106c3f0bfe744a9f58c2ee61bf592877ccbd`

### TableHeaderCell — `1289:7` (COMPONENT_SET, 3 variants)
| Variant | Key |
|---|---|
| SortState=none | `e4770692188dcaff2aafd498fbc1b598fa84ef96` |
| SortState=asc | `c00fee3039d0969ef44c67e1bfb121ba4c1f67dc` |
| SortState=desc | `a48728e6bbf998c8c4c6fc02958192658fff5593` |

### Table Row — `33:53` (COMPONENT_SET, 3 variants)
| Variant | Key |
|---|---|
| State=default | `370c6e67ba66839fc584cc4b0d6d5465eaf397b5` |
| State=hover | `d05e1b2089cf9a2653616f64ab84ad04b26e93c2` |
| State=selected | `36c523269c708807a9641f871bf03e2e5ba76c3f` |

---

## Tabs Components

### Tabs — `707:9` (COMPONENT_SET, 3 variants)
Set key: `8c4831ce48ed404e5b471c70a56f18bf9a7f4e7a`
| Variant | Key |
|---|---|
| Variant=line | `ac85de8e17286bd8fa791ad6c5fa74b5d3852873` |
| Variant=contained | `d3a40ba48faf6018ade9932b0cffb4484e4fdeb4` |
| Variant=default | `e96e2a32ce99ff68c1e7b1a1225cdae300e824fa` |

### TabItem — `1286:2` (COMPONENT_SET, 12 variants)
Set key: `db06a71468f0d378475e6e2faed82b3003723eed`
| Variant | Key |
|---|---|
| Variant=line, State=active | `f3e66f73f71794d74326057c318f5d86f5ab0087` |
| Variant=line, State=inactive | `b0b898fdf55773aeae25da42a335b948a8b95f2f` |
| Variant=line, State=hover | `9b9e7c11f9d7d1fc2b18df082de3ceb1c4987302` |
| Variant=line, State=disabled | `63dc47d196a44a89cb20206430e0b8db725a3e3b` |
| Variant=contained, State=active | `8231ade36132ce21d147025fa9a612824cf98630` |
| Variant=contained, State=inactive | `c893038cec6f9bbb09695edc6e4013d8ec4c07ec` |
| Variant=contained, State=hover | `b7319617f50455201bc5cb5ef1bd1d4342dfd2df` |
| Variant=contained, State=disabled | `726523829f988415c28eb14945ea42e37958dc32` |
| Variant=default, State=active | `443a4f1636fe6e150b9cf973e1755447d214a115` |
| Variant=default, State=inactive | `40df1924a70a9f8813341296ac1e601e9c662103` |
| Variant=default, State=hover | `3c46ed86df6568e9dbeea0d13fa546b2f26e2aef` |
| Variant=default, State=disabled | `927be8c31773798e413855ef8c923d789501e6ea` |

---

## Tree Components

### TreeItem — `1328:20` (COMPONENT_SET, 18 variants)
Set key: `3f2df8df481bf6ecbd0208fa77736126f1307601`

**Slot naming:** Use `findOne(n => n.name === "ChevronSlot")` and `findOne(n => n.name === "IconSlot")` — never search by `"icon"` substring (matches `Icons/ChevronRight` first).

| Variant | Node ID | Key |
|---|---|---|
| default, Default, Level=0 | 1327:5 | `49f2f4a0661a0fa96310fb3e511d4b1eed4ee7cd` |
| default, Default, Level=1 | 1327:14 | `ca8c22c443c98d1c369172e37b2ecb9b3cb38011` |
| default, Default, Level=2 | 1327:23 | `ea76797de9be8973f4367d36456acea4e1219054` |
| default, Hover, Level=0 | 1327:32 | `56e6445795df44200b073ef029527ddebc097ae6` |
| default, Hover, Level=1 | 1327:41 | `77268d57eeddc1f14fd5a8657adbe0495b6b4091` |
| default, Hover, Level=2 | 1327:50 | `a70e2e8fe8aed3c474715f2c04b2a8501ff7c423` |
| default, Selected, Level=0 | 1327:59 | `9ade8419cb89ed3720e428504568c3deac161292` |
| default, Selected, Level=1 | 1327:68 | `853a67cc685fe73782889d48f5fa6c46fc6ffb50` |
| default, Selected, Level=2 | 1327:77 | `db6db9ced052e33640cd85a69c495dbf2d2878fc` |
| nav, Default, Level=0 | 1327:86 | `aab380948ab0c758cdbd17e8503002fbbb5ed9ee` |
| nav, Default, Level=1 | 1327:95 | `45b803bda141f28f72677a5f9ae5ffdeeb9c1f1e` |
| nav, Default, Level=2 | 1327:104 | `20e768b029f2a15d1310ae32371ad9e6431aa7ab` |
| nav, Hover, Level=0 | 1327:113 | `5f3d29c019a0a604e88486325a42c9435ab87a84` |
| nav, Hover, Level=1 | 1327:122 | `48197e2c66bd36e317296187b88521c0c229983b` |
| nav, Hover, Level=2 | 1327:131 | `13c02bfa7dbfabf87a771447f2fadb2026f6c3d2` |
| nav, Selected, Level=0 | 1327:140 | `7f07d3fa81354115c7c9aeb8784aa515fa1e7c92` |
| nav, Selected, Level=1 | 1327:149 | `b7fd4b073d707d4b28201404cebc57e85289418f` |
| nav, Selected, Level=2 | 1327:158 | `6e429c0e423c89be7483512cfb121cc165deac80` |

### Tree — `1330:76` (COMPONENT_SET, 2 variants)
Set key: `a9542a9d12abbcdede3d89e992a11396ed4f8408`
| Variant | Key |
|---|---|
| Variant=default | `a3c2fb8908e559090c8bc8ac2a999cc87d33ac08` |
| Variant=nav | `36e8aa2b6f6d2ebb35774d399c1ea94df6ec8e00` |

---

## Shell Components

| Component | Node ID | Key | Notes |
|---|---|---|---|
| TopBar | 209:36 | `727f0fde316ad4d9870d1386fc0aadfd3ab75f74` | 48px, bg-secondary |
| LeftNav (Sidebar) | 214:89 | `0d4bc6674c60338fd70587bfd8bebb7dc4e8391c` | 200px collapsible |
| NewButton | 798:121 | `a42d69f70f90f72871dee133a2c97581fbc7d1e1` | Brand-red tint |
| AppShell | 798:124 | `238e6b096582cd25a79b6528a13b807f8e9eb54a` | TopBar + LeftNav |
| PageHeader | 446:6 | `62a8d5b1771a696f02926db2ee419d72f85a425f` | Breadcrumbs + title + actions |
| FilterBar | 980:35 | `a80f80b7005929f977f540098d4306346f0baff1` | |
| Pagination | 983:24 | `ad043e2cd86cdcc236a3983b74b5bbb1e54ba947` | |
| AppSwitcher | 761:8 | `62c122c8d4af79dc3b2f2fc8e5450b17351f5fb5` | |
| NavItem | 207:32 | `cd4760ec5f784e5c7bc1c58b79d7662ba85defa7` | COMPONENT_SET, State(default/active) |
| SectionHeader | 208:16 | `87059ad359c860fe498b9628206aa32d06b9a390` | |

---

## Catalog Components (Shell - Catalog page)

| Component | Node ID | Key | Notes |
|---|---|---|---|
| MetaItem | 1612:417 | `d43d1a7fab29c6e9188db392d2e865c63f69d75a` | Label + value pair |
| SidebarPanel | 1612:426 | `1d97f5288362de32e078a689b17acd80e18505a5` | Panel container template |
| SqlCodeBlock | 1612:443 | `04400fc978f41f322e99ea3b8d95ac23e1d9b277` | Syntax-highlighted SQL block |

### FilterPill — `1643:468` (COMPONENT_SET, 8 variants)
Set key: `5e7fffbe38a9d1ea02fd4989a4949ec9046c0b2f`

| Variant | Node ID | Key |
|---|---|---|
| Active=false, HasIcon=false, Hover=false | 1643:456 | `198f9259749630a5bcdf04ddf43fe1be422b63b5` |
| Active=false, HasIcon=true, Hover=false | 1643:458 | `4d9f25701c3f1a1f5745d7fffe4a25cd5f905e83` |
| Active=true, HasIcon=false, Hover=false | 1643:462 | `4b054612f51e294af04034a9f6f41d7a47b9bba8` |
| Active=true, HasIcon=true, Hover=false | 1643:464 | `ea01dedb63795b30ec69735d948b4b11e5720ee9` |
| Active=false, HasIcon=false, Hover=true | 1650:1035 | `077417ce1628d669ef270d4f2eb6eb35d7192c3d` |
| Active=false, HasIcon=true, Hover=true | 1650:1037 | `b6c34c0097e8cb67a17c1e41b6fbf8ad17ff439e` |
| Active=true, HasIcon=false, Hover=true | 1650:1041 | `d550e0c3f57078499938e528ca848fc4ef901d36` |
| Active=true, HasIcon=true, Hover=true | 1650:1043 | `5f4b31ce1a2c5e4166de04bc005589494ce78aca` |

**Active label token:** `primary` variable (not `action/hover` — that's 8% alpha, backgrounds only).

### CatalogListRow — `1643:491` (COMPONENT_SET, 2 variants)
Set key: `7e88c7a639a4c9e8426c81c94d5c2e058ffdaf03`

| Variant | Node ID | Key |
|---|---|---|
| State=Default | 1643:469 | `225ad0b8ddee33296618fb5c798c6ecb04aae6d3` |
| State=Hover | 1643:480 | `06c9ad17b02814789eb7061feb08180cf621f779` |

Structure: h-12 (48px), 3 columns [FILL | 220px | 160px], icon slot named `"row-icon"`, text nodes named `"name"`, `"path"`, `"reason"`, `"type"`.

---

## Custom Components (Cover / Notebook page)

| Component | Node ID | Key | Variants |
|---|---|---|---|
| Spinner | 1200:171 | *(get via getNodeByIdAsync)* | Size(small/default/large) |
| Empty | 1201:25 | `63a68c7cf15f49f5599d265154929b126398f85a` | HasTitle × HasAction (4) |
| NotebookCell | 1203:43 | `b37afa9e474f1837c9da96a4efea2c6e3194f944` | Language(Python/SQL/Markdown/Scala/R) |
| EditorTabBar | 1211:25 | `99b04c8388079acaca28a270a66da11e9ee1df3f` | State(default/active) |

---

## Genie Components (Shell page)

| Component | Node ID | Key | Notes |
|---|---|---|---|
| SuggestionPill | 1684:14 (set) | `78c40fdd7b54f5c277bbcae0dece8c1803e6a840` | State=Default `6f8fbfb5885e3a4cb978c1c09164a0f6487ab557` · Hover `f5c4e48dd7995b680b961bf24478fbf56224d04f` |
| GenieCodePanel | 1686:80 | `9dc877feb0fd2cab6015b1cdf2c326b328569f9c` | 360px panel, 3 zones: Header / Body / Compose |

**GenieCodeIcon (DuBois library):** `d29ff31972dcec8938b3553b305b9d2cd750cc45` — import with `importComponentByKeyAsync`

---

## Figma Screens

| Screen | Frame Node ID | Page |
|---|---|---|
| Cover / Landing page | 18:2 | Cover |
| Catalog / Table detail | 1510:2 | Shell - Catalog |
| Catalog / List | 1645:473 | Shell - Catalog |

---

## Design Token Variables

Import with: `await figma.variables.importVariableByKeyAsync("key")`  
Then bind: `node.fills = [figma.variables.setBoundVariableForPaint(paint, "color", variable)]`

### Semantic Colors (Collection: Color)
| Token | Variable ID | Key |
|---|---|---|
| background | VariableID:8:2 | `f72f92fbcd643e862d116e885216c12c57b69d21` |
| foreground | VariableID:8:3 | `e3cf81e7a1b508d8c18edc820dd8d489026199bf` |
| card | VariableID:8:4 | `b7357c09b7a8a405a3662fa902b951d456523883` |
| card-foreground | VariableID:8:5 | `5aa108a237b2da49622b66a715541ac3498b5f67` |
| popover | VariableID:8:6 | `2c543576f1dea0bfb6c79b9ba31993e33ad16f30` |
| popover-foreground | VariableID:8:7 | `1f3836fea193e609932c1c381b7ca25eb0fdcf52` |
| primary | VariableID:8:8 | `35a88d92b7805e99ea334c1c8f62327ab0778547` |
| primary-foreground | VariableID:8:9 | `2fc35179563e54c89d5ff35f09fe3544f8e65807` |
| secondary | VariableID:8:10 | `ae9ff9d13b262a17ac55cb04142530d5de4d268f` |
| secondary-foreground | VariableID:8:11 | `5278a8c1c59a3084b952f3447685f55dd112c6c6` |
| muted | VariableID:8:12 | `6a3aef37dcfabd950eb9a1267ba7ec0a77d1c356` |
| muted-foreground | VariableID:8:13 | `7feee8e49be37a3f711b341c29278beb33b8c636` |
| accent | VariableID:8:14 | `2826114bedae4142ccf1e21a28118a6f9decd433` |
| accent-foreground | VariableID:8:15 | `6e7133803cb32e8c7f6962488b8e91ea0452990b` |
| destructive | VariableID:8:16 | `d91301f59a4dd431497a73e828d499d8b697a02e` |
| border | VariableID:8:17 | `e3ffa534f8e3da2a2a959894164d8139e4284c5c` |
| input | VariableID:8:18 | `3fc939fa16dce42f4a5c99eeabb7c76b6b276d48` |
| ring | VariableID:8:19 | `7ae56c565afc30c2108a716573b922f2286b4e9f` |
| warning | VariableID:8:20 | `babbfe2f2ce1f9a073149f19c029e90e68ad4d86` |
| success | VariableID:8:21 | `793d03a8834853c52d42e03513adec7ae1c18714` |
| alert/border-danger | VariableID:8:22 | `e8099afd23b9f0cde36fb8be40b2a6aecff4b985` |
| alert/border-warning | VariableID:8:23 | `f80cef1eb927dbe19f06868d44021d36e7f0686b` |
| alert/border-success | VariableID:8:24 | `d03e40bc1e7c524be07d50456e60bdccb37ba658` |
| alert/background-danger | VariableID:8:25 | `a070fc39a091a5f9c8f2239cade84a3d92509437` |
| alert/background-warning | VariableID:8:26 | `6a3d874ef5beb6a90d048ddcd1aa47ed85441328` |
| alert/background-success | VariableID:8:27 | `9f1817ff17172b255845c897827015054cd60475` |

### Special Variables
| Token | Variable ID | Key | Notes |
|---|---|---|---|
| action/hover | VariableID:1065:1060 | `0422680699b474957c6b3152565b03dbda70c705` | **Background overlay only** — 8% alpha. Never use for text color. |

### Primitive Colors (Collection: Primitives) — quick reference
| Token | Key |
|---|---|
| white | `2f8695893b0536df621056f84b954eed1c9a9b9e` |
| blue/600 | `2e5342e25ce1befaccf3b1b88612c8c125b27a4e` |
| blue/700 | `fb9434ed9e66a6e05af4930b8967613fb186eb76` |
| grey/050 | `3eb1394dfbfa2170b5d66c1188be637509ab1c59` |
| grey/100 | `59d4998afd56cca4ea46f0227090b9062defe65d` |
| grey/500 | `711fa4ecf2eb572a32a1c31687fe69148fb946b1` |
| grey/800 | `9311d5a5a67fe467389eb51d061a5d8590d9efd3` |
| red/600 | `0591591012a392d4db61b53033b618648fa59e8f` |
| green/600 | `951f22d030a36ddcd8a4b4f963fa03fdbdbdb2ba` |
| yellow/600 | `e101f704b2782d13d94e577856c3b4c1415b15a0` |

### Spacing / Radius (Collection: Spacing)
| Token | Key |
|---|---|
| radius/base (4px) | `19b4d1839d40bac0941c342fdce986f690f7df8c` |
| radius/md (8px) | `fbec3fd473010efe72c82125390dae4f1b4b85b6` |
| radius/full | `951bbeba746048b58404af7477c859dfb1d9308b` |

---

## Text Styles

Import with: `await figma.importStyleByKeyAsync("key")`  
Then apply: `await textNode.setTextStyleIdAsync(style.id)`

| Style | Key | Size | Weight | Line Height |
|---|---|---|---|---|
| heading/h1 | `ced7984836789d348c69194699119e0689b75b31` | 32 | Semibold | 40px |
| heading/h2 | `d86cd2a4d7386d5b5a145a4fdb60640b0382e1db` | 22 | Semibold | 28px |
| heading/h3 | `bb173dd8d3434da0350b6bfccf6e17eca10760e9` | 18 | Semibold | 24px |
| heading/h4 | `b082edde456476dc802f5ea0c58b5811aa7ec5cd` | 15 | Semibold | 20px |
| heading/h5 | `c2ba9600d4d8225f895d36c2d907d5cf219bd522` | 13 | Semibold | 20px |
| heading/h6 | `1c3bc8b67ddf2b517a8da06b0cb239b9827bf6d1` | 12 | Semibold | 16px |
| body/base | `24ca98d883e47b42d6c9aad6dac52c467202c6b4` | 13 | Regular | 20px |
| body/md | `c3255b7064f793de89f519934eaaaf67e4cd3610` | 16 | Regular | 24px |
| body/xs (= body/hint) | `798b989e6a837ddb93d1637c14e3a86f793e2f87` | 12 | Regular | 16px |
| body/hint | `6a76105288ee0c7643927180397f0b067eed1a4b` | 12 | Regular | 16px |
| label/xs | `f038c69c6ee076ed44427841b7443c114cdc4b34` | 12 | Semibold | 16px |

**Font:** Always `SF Pro` in Figma (never Inter). Use `SF Pro Text` in Plugin API scripts — plain `SF Pro` renders at w=0.

---

## Icons

Icons live on the **Icons** page. There are 445 components, all named `Icons/ComponentName`.

**Look up an icon key:**
```js
const iconsPage = figma.root.children.find(p => p.name === "Icons");
const icon = iconsPage.findOne(n => n.type === "COMPONENT" && n.name === "Icons/YourIconName");
return { id: icon.id, key: icon.key };
```

### Common icon keys
| Code name | Figma key |
|---|---|
| Icons/Table | `9fff29c3b9592b83543cf766f3044cc95b5a03e4` |
| Icons/Catalog | `20bbfc937bf9e97c169be88a66e7059c373dbb11` |
| Icons/Schema | *(search: `Icons/Schema`)* |
| Icons/ChevronRight | `c8f08c4f7f43fdf56d9be778cdd8f14eeb44af63` |
| Icons/ChevronDown | `974cd52de385cbe4f0c4aeffbd87cec367a910f4` |
| Icons/Close | `164a0d7792675cff5cd40002a401df4e94942ec6` |
| Icons/Check | `a17c286bc9b1eb70303e5e7c31122f942747ba0e` |
| Icons/Copy | `7f86af665c67b7e764dac0e9a8ab2da3f3235e39` |
| Icons/Search | *(search: `Icons/Search`)* |
| Icons/Assistant | `fdfe77a22f3c7227c1f17f2f74dc9b59a7f3bb76` |
