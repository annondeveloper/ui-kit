# Docs & Demo Accuracy Consolidation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cross-reference every demo page and docs section against `/home/devesh/full_context.md` (7,258-line source-of-truth) to ensure 100% accuracy of props, types, defaults, code examples, and documentation.

**Architecture:** Each component page has a PropsTable and code examples. The source-of-truth document defines the exact props, types, defaults, CSS variables, data attributes, ARIA attributes, keyboard interactions, classNames, sub-types, and tier differences for every component. We systematically update each page's PropsTable to match the source exactly, then update code examples to demonstrate all significant props.

**Tech Stack:** React, TypeScript, Vite demo app

**Source of Truth:** `/home/devesh/full_context.md`

---

## Strategy

### What needs updating on each component page:

1. **PropsTable** — Must list ALL props from full_context.md with correct types, defaults, required flags, and descriptions
2. **Code examples** — Must demonstrate key props that are currently missing (variants, sizes, sub-types, callbacks)
3. **Accessibility section** — Must list correct ARIA attributes and keyboard interactions from source
4. **Tier differences** — Must accurately describe lite vs standard vs premium differences
5. **Sub-types** — Complex components with sub-types (SelectOption, TimelineItem, etc.) must document them

### What NOT to change:
- Don't change the page structure/layout pattern (hero, examples, props, tiers)
- Don't change the PropsTable component itself
- Don't change routing or navigation
- Don't add new component pages

### Execution approach:
- Each task handles one CATEGORY of components (8-25 pages per task)
- Within each task, the agent reads full_context.md sections for those components, reads the current page, and updates PropsTable + examples
- Tasks are independent and can run in parallel

---

## Task 1: Actions & Buttons (5 pages)

**Components:** Button, ButtonGroup, ActionIcon, CopyButton, ShimmerButton

**Files to modify:**
- `demo/src/pages/components/ButtonPage.tsx`
- `demo/src/pages/components/ButtonGroupPage.tsx`
- `demo/src/pages/components/ActionIconPage.tsx`
- `demo/src/pages/components/CopyButtonPage.tsx`
- `demo/src/pages/components/ShimmerButtonPage.tsx`

**Source reference:** full_context.md lines 218-316 (Button, ButtonGroup, ActionIcon), 361-397 (CopyButton), 5809-5840 (ShimmerButton)

For each page:
- [ ] **Step 1:** Read the component's section in full_context.md and the current page file
- [ ] **Step 2:** Compare PropsTable props against full_context.md — add missing props, fix incorrect types/defaults
- [ ] **Step 3:** Ensure sub-types are documented (ButtonShortcuts for Button, etc.)
- [ ] **Step 4:** Add missing code examples for undemo'd props (e.g. Button's `loadingText`, `iconOnly`, `fullWidth`, `classNames`)
- [ ] **Step 5:** Verify accessibility section matches ARIA attributes and keyboard interactions from source
- [ ] **Step 6:** Verify tier differences text matches source (Lite vs Premium descriptions)
- [ ] **Step 7:** Commit: `docs: update Actions & Buttons pages to match source-of-truth`

---

## Task 2: Form Inputs — Text & Selection (8 pages)

**Components:** FormInput, Select, Combobox, MultiSelect, SearchInput, Textarea, PasswordInput, NumberInput

**Files to modify:**
- `demo/src/pages/components/FormInputPage.tsx`
- `demo/src/pages/components/SelectPage.tsx`
- `demo/src/pages/components/ComboBoxPage.tsx`
- `demo/src/pages/components/MultiSelectPage.tsx`
- `demo/src/pages/components/SearchInputPage.tsx`
- `demo/src/pages/components/TextareaPage.tsx`
- `demo/src/pages/components/PasswordInputPage.tsx`
- `demo/src/pages/components/NumberInputPage.tsx`

**Source reference:** full_context.md lines 399-1073

For each page:
- [ ] **Step 1:** Read the component's section in full_context.md and the current page file
- [ ] **Step 2:** Update PropsTable to include ALL props — pay special attention to:
  - Select: `searchable`, `clearable`, `multiple` props + SelectOption sub-type (value, label, disabled, icon, group)
  - Combobox: `allowCreate`, `onCreate`, `loading`, `emptyMessage` + ComboboxOption sub-type
  - MultiSelect: `maxSelected`, `searchable`, `clearable` + MultiSelectOption sub-type
  - FormInput: `maxLength`, `showCount`, `clearable`, `onClear`, `classNames` (7 slots)
  - SearchInput: `debounce`, `onSearch`, `onClear`, `clearable`
  - Textarea: `autoResize`, `minRows`, `maxRows`, `resize`, `showCount`
  - PasswordInput: `showStrengthMeter`, `strengthLabels`, `visibilityToggle`, `onStrengthChange`
  - NumberInput: `precision`, `hideControls`, `clampBehavior`, `prefix`, `suffix`, `thousandSeparator`, `allowNegative`, `allowDecimal`
- [ ] **Step 3:** Add sub-type documentation tables where missing
- [ ] **Step 4:** Add code examples for advanced props not currently shown
- [ ] **Step 5:** Verify Form Context notes ("Auto-wires with `<Form>`") are present where applicable
- [ ] **Step 6:** Commit: `docs: update Form Input (text/selection) pages to match source`

---

## Task 3: Form Inputs — Specialized (8 pages)

**Components:** ColorInput, FileUpload, InlineEdit, OtpInput, PinInput, TagInput, DatePicker, TimePicker

**Files to modify:**
- `demo/src/pages/components/ColorInputPage.tsx`
- `demo/src/pages/components/FileUploadPage.tsx`
- `demo/src/pages/components/InlineEditPage.tsx`
- `demo/src/pages/components/OtpInputPage.tsx`
- `demo/src/pages/components/PinInputPage.tsx`
- `demo/src/pages/components/TagInputPage.tsx`
- `demo/src/pages/components/DatePickerPage.tsx`
- `demo/src/pages/components/TimePickerPage.tsx`

**Source reference:** full_context.md lines 662-960, 1189-1355

For each page:
- [ ] **Step 1:** Read source sections and current pages
- [ ] **Step 2:** Update PropsTable — key props to verify:
  - ColorInput: `swatches`, `showInput`
  - FileUpload: `accept`, `maxSize`, `maxFiles`, `showPreview`
  - InlineEdit: `multiline`, `editTrigger` ('click'|'dblclick'), `onSave`, `onCancel`
  - OtpInput: `length` (default 6), `type` ('number'|'text'), `onComplete`, `autoFocus`
  - PinInput: `length` (default 4), `mask` (default true), `type` ('number'|'alphanumeric'), `placeholder` ('○'), `oneTimeCode`, `manageFocus`
  - TagInput: `maxTags`, `allowDuplicates`, `validate`
  - DatePicker: `min`, `max`, `showWeekNumbers`, `firstDayOfWeek`
  - TimePicker: `format` ('12h'|'24h'), `minuteStep`, `minTime`, `maxTime`, `clearable`
- [ ] **Step 3:** Add code examples for undemo'd props
- [ ] **Step 4:** Commit: `docs: update specialized Form Input pages to match source`

---

## Task 4: Form Controls (6 pages)

**Components:** Checkbox, RadioGroup, ToggleSwitch, Slider, Rating, Calendar

**Files to modify:**
- `demo/src/pages/components/CheckboxPage.tsx`
- `demo/src/pages/components/RadioGroupPage.tsx`
- `demo/src/pages/components/ToggleSwitchPage.tsx`
- `demo/src/pages/components/SliderPage.tsx`
- `demo/src/pages/components/RatingPage.tsx`
- `demo/src/pages/components/CalendarPage.tsx`

**Source reference:** full_context.md lines 1358-1651

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - Checkbox: `indeterminate`, `error`
  - RadioGroup: `options` (RadioOption sub-type), `orientation`, `label`
  - ToggleSwitch: `error`
  - Slider: `showValue`, `showTicks`
  - Rating: `allowHalf`, `icon`, `emptyIcon`, `color`, `readOnly`
  - Calendar: `disabledDates`, `locale`, `showOutsideDays`, `showWeekNumbers`, `numberOfMonths`, `highlightToday` (note: internal _range* props should NOT be in docs)
- [ ] **Step 3:** Add RadioOption and other sub-type tables
- [ ] **Step 4:** Commit: `docs: update Form Controls pages to match source`

---

## Task 5: Data Display — Badges & Status (8 pages)

**Components:** Badge, StatusBadge, StatusPulse, Avatar, AvatarUpload, Chip, Indicator, Kbd

**Files to modify:**
- `demo/src/pages/components/BadgePage.tsx`
- `demo/src/pages/components/StatusBadgePage.tsx`
- `demo/src/pages/components/StatusPulsePage.tsx`
- `demo/src/pages/components/AvatarPage.tsx`
- `demo/src/pages/components/AvatarUploadPage.tsx`
- `demo/src/pages/components/ChipPage.tsx`
- `demo/src/pages/components/IndicatorPage.tsx`
- `demo/src/pages/components/KbdPage.tsx`

**Source reference:** full_context.md lines 1654-2224

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - Badge: `dot`, `pulse`, `count`, `maxCount` (default 99), `removable`, `onRemove`, `outline`
  - StatusBadge: `status` (6 values including 'unknown', 'maintenance'), `pulse`
  - StatusPulse: `status` (4 values), `label`
  - Avatar: `src`, `alt`, `name`, `status` (4 values), `icon`
  - AvatarUpload: `value`, `onChange` (file, preview), `onRemove`, `size` (number, default 120), `accept`, `maxSize`, `shape` ('circle'|'square')
  - Chip: `checked`, `defaultChecked`, `onChange`, `variant` ('outline'|'filled'|'light'), `color` (5 values)
  - Indicator: `position` (4 positions), `processing`, `inline`, `withBorder`, `offset`
  - Kbd: `size` ('xs'|'sm'|'md'), `variant` ('default'|'ghost')
- [ ] **Step 3:** Commit: `docs: update Badge & Status display pages to match source`

---

## Task 6: Data Display — Content (8 pages)

**Components:** Card, Skeleton, Progress, AnimatedCounter, SuccessCheckmark, Timeline, Stepper, Typography

**Files to modify:**
- `demo/src/pages/components/CardPage.tsx`
- `demo/src/pages/components/SkeletonPage.tsx`
- `demo/src/pages/components/ProgressPage.tsx`
- `demo/src/pages/components/AnimatedCounterPage.tsx`
- `demo/src/pages/components/SuccessCheckmarkPage.tsx` (if exists, else skip)
- `demo/src/pages/components/TimelinePage.tsx`
- `demo/src/pages/components/StepperPage.tsx`
- `demo/src/pages/components/TypographyPage.tsx`

**Source reference:** full_context.md lines 1875-2373

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - Card: `as` (polymorphic), `variant` (6 values inc. 'glass', 'gradient'), `padding`, `interactive`, `header`, `footer`, `expandable`, `defaultExpanded`, `loading`, `bordered`, `classNames` (4 slots), `href`, `target`, `rel`
  - Skeleton: `variant` (4 values), `lines`, `lineHeight`, `lineGap`, `animation` ('shimmer'|'pulse'|'wave'), `count`, `direction`, `speed`
  - Progress: `showValue`
  - AnimatedCounter: `format`, `duration` (default 500)
  - Timeline: `items` (TimelineItem sub-type with id, title, description, icon, timestamp, status), `variant` (3), `connectorStyle` (3)
  - Stepper: `steps` (StepperStep sub-type), `activeStep`, `variant` (3), `onStepClick`
  - Typography: `variant` (11 values), `color` (7 values), `weight` (6 values), `align`, `truncate`, `as`
- [ ] **Step 3:** Add TimelineItem and StepperStep sub-type tables
- [ ] **Step 4:** Commit: `docs: update Content display pages to match source`

---

## Task 7: Data Display — Links, Text, Dividers (5 pages)

**Components:** Link, Spoiler, Divider, Highlight, TruncatedText

**Files to modify:**
- `demo/src/pages/components/LinkPage.tsx`
- `demo/src/pages/components/SpoilerPage.tsx`
- `demo/src/pages/components/DividerPage.tsx`
- `demo/src/pages/components/HighlightPage.tsx`
- `demo/src/pages/components/TruncatedTextPage.tsx`

**Source reference:** full_context.md lines 2375-2497, 3670-4210

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - Link: `variant` (3), `underline` ('always'|'hover'|'none'), `external`
  - Spoiler: `maxHeight` (required), `showLabel` (default 'Show more'), `hideLabel` (default 'Show less'), `initialState`, `transitionDuration` (default 350)
  - Divider: `orientation`, `variant` ('solid'|'dashed'|'dotted'), `label`, `spacing`
  - Highlight: `highlight` (string|string[]), `color`, `caseSensitive`, `highlightClassName`
  - TruncatedText: `text` (required), `lines` (default 1), `expandable`, `showTooltip` (default true)
- [ ] **Step 3:** Commit: `docs: update Link, Text & Divider pages to match source`

---

## Task 8: Overlays (8 pages)

**Components:** Tooltip, NativeTooltip, Popover, Dialog, ConfirmDialog, Sheet, DropdownMenu, Drawer

**Files to modify:**
- `demo/src/pages/components/TooltipPage.tsx`
- `demo/src/pages/components/NativeTooltipPage.tsx`
- `demo/src/pages/components/PopoverPage.tsx`
- `demo/src/pages/components/DialogPage.tsx`
- `demo/src/pages/components/ConfirmDialogPage.tsx`
- `demo/src/pages/components/SheetPage.tsx`
- `demo/src/pages/components/DropdownMenuPage.tsx`
- `demo/src/pages/components/DrawerPage.tsx`

**Source reference:** full_context.md lines 2497-2841

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - Tooltip: `placement` (4), `delay` (default 300), `offset` (default 8), `interactive`, `maxWidth`
  - NativeTooltip: only `content` (string) and `children`
  - Popover: `placement` (4), `offset` (default 8), `arrow` (default true), `modal`
  - Dialog: `title`, `description`, `size` (4 inc 'full'), `closeOnOverlay`, `closeOnEscape`, `showClose`, `footer`, `preventClose`, `classNames` (7 slots)
  - ConfirmDialog: `confirmLabel`, `cancelLabel`, `variant` ('default'|'danger'), `loading`
  - Sheet: `side` ('left'|'right'|'bottom'), `title`, `description`, `showClose`
  - DropdownMenu: `items` (MenuItem sub-type with type, label, icon, shortcut, disabled, danger, onClick), `placement` (4)
  - Drawer: `side` (4), `size` (4 inc 'full'), `overlay` (default true)
- [ ] **Step 3:** Add MenuItem sub-type table for DropdownMenu
- [ ] **Step 4:** Commit: `docs: update Overlay pages to match source`

---

## Task 9: Overlays & Command (3 pages)

**Components:** Spotlight, CommandBar, Tour

**Files to modify:**
- `demo/src/pages/components/SpotlightPage.tsx`
- `demo/src/pages/components/CommandBarPage.tsx`
- `demo/src/pages/components/TourPage.tsx`

**Source reference:** full_context.md lines 2844-2902 (Spotlight), 6449-6508 (CommandBar), 6789-6843 (Tour)

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - Spotlight: `actions` (SpotlightAction sub-type: id, title, description, icon, group, keywords, onClick), `shortcut`, `placeholder`, `nothingFoundMessage`, `limit`, `filter`
  - CommandBar: `items` (CommandItem sub-type: id, label, description, icon, shortcut, section, onSelect, disabled, keywords), `open` (required), `onOpenChange` (required), `placeholder`, `emptyMessage`, `shortcut`
  - Tour: `steps` (TourStep sub-type: target, title, description, placement, onShow), `open`, `onClose`, `onFinish`, `currentStep`, `onStepChange`, `closeOnOverlay`, `closeOnEscape`, `showProgress`, `showSkip`
- [ ] **Step 3:** Add all sub-type tables (SpotlightAction, CommandItem, TourStep)
- [ ] **Step 4:** Commit: `docs: update Spotlight, CommandBar & Tour pages to match source`

---

## Task 10: Navigation (8 pages)

**Components:** Tabs, Breadcrumbs, Pagination, Sidebar, Navbar, AppShell, TableOfContents, SegmentedControl

**Files to modify:**
- `demo/src/pages/components/TabsPage.tsx`
- `demo/src/pages/components/BreadcrumbsPage.tsx`
- `demo/src/pages/components/PaginationPage.tsx`
- `demo/src/pages/components/SidebarPage.tsx`
- `demo/src/pages/components/NavbarPage.tsx`
- `demo/src/pages/components/AppShellPage.tsx`
- `demo/src/pages/components/TableOfContentsPage.tsx`
- `demo/src/pages/components/SegmentedControlPage.tsx`

**Source reference:** full_context.md lines 2905-3307

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - Tabs: `tabs` (Tab sub-type: id, label, icon, disabled, badge, closeable), `activeTab`, `defaultTab`, `onClose`, `variant` (3), `orientation`, `lazy`
  - Breadcrumbs: `items` (BreadcrumbItem: label, href, icon), `separator`, `maxVisible`, `onNavigate`
  - Pagination: `page` (required), `totalPages` (required), `onChange` (required), `siblingCount`, `showFirst`, `showPrevNext`
  - Sidebar: `collapsed`, `onCollapse`, `width` (default 240), `collapsedWidth` (default 64), `position`
  - Navbar: `logo`, `actions`, `sticky` (default true), `bordered` (default true), `transparent`, `height` (default 56)
  - AppShell: `navbar`, `sidebar`, `footer`, `sidebarCollapsed`, `sidebarPosition`
  - TableOfContents: `items` (TocItem: id, label, level, children), `activeId`, `scrollSpy`, `scrollOffset`, `variant` (3)
  - SegmentedControl: `data` (SegmentedControlOption[] | string[]), `fullWidth`, `orientation`, `color`, `disabled`, `readOnly`
- [ ] **Step 3:** Add all sub-type tables (Tab, BreadcrumbItem, TocItem, SegmentedControlOption)
- [ ] **Step 4:** Commit: `docs: update Navigation pages to match source`

---

## Task 11: Navigation — Additional (5 pages)

**Components:** Accordion, Carousel, FilterPill, TransferList, Affix, BackToTop

**Files to modify:**
- `demo/src/pages/components/AccordionPage.tsx`
- `demo/src/pages/components/CarouselPage.tsx`
- `demo/src/pages/components/FilterPillPage.tsx`
- `demo/src/pages/components/TransferListPage.tsx`
- `demo/src/pages/components/AffixPage.tsx`
- `demo/src/pages/components/BackToTopPage.tsx`

**Source reference:** full_context.md lines 3382-3584, 3309-3378

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - Accordion: `items` (AccordionItem: id, trigger, content, disabled, icon), `type` ('single'|'multiple'), `defaultOpen`, `variant` (3), `size` (3)
  - Carousel: `autoPlay`, `autoPlayInterval` (default 5000), `showArrows`, `showDots`, `loop`, `slidesPerView`, `gap`
  - FilterPill: `label` (required), `active`, `onRemove`, `count`, `icon`
  - TransferList: `value` (required tuple), `onChange` (required), `titles`, `searchable`, `showTransferAll`, `listHeight`
  - Affix: `position` (object), `zIndex`, `withinPortal`, `target`
  - BackToTop: `visibleFrom` (default 400), `smooth` (default true), `showProgress`
- [ ] **Step 3:** Add sub-type tables (AccordionItem, TransferListItem, SortableItem)
- [ ] **Step 4:** Commit: `docs: update Layout & Navigation pages to match source`

---

## Task 12: Data Tables & Trees (5 pages)

**Components:** DataTable, SmartTable, TreeView, SortableList, KanbanColumn

**Files to modify:**
- `demo/src/pages/components/DataTablePage.tsx`
- `demo/src/pages/components/SmartTablePage.tsx`
- `demo/src/pages/components/TreeViewPage.tsx`
- `demo/src/pages/components/SortableListPage.tsx`
- `demo/src/pages/components/KanbanColumnPage.tsx`

**Source reference:** full_context.md lines 3792-4084

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable for DataTable (the biggest: ~40 props) — ensure ALL are present:
  - Critical: `filterable`, `filters`, `onFilterChange`, `groupBy`, `aggregations`, `expandedGroups`, `onGroupToggle`, `editable`, `onCellEdit`, `serverSide`, `totalRows`, `onFetchData`, `autoSizeColumns`, `showSuggestions`
  - SmartTable: `searchable`, `searchPlaceholder`, `filterable`, `paginated`, `columnToggle`
  - TreeView: `nodes` (TreeNode sub-type: id, label, icon, children, disabled, data), `selected`, `onSelect`, `expanded`, `onExpand`, `multiSelect`, `lazy`, `showGuides`
  - SortableList: `items` (SortableItem: id, content), `handle`, `orientation`
  - KanbanColumn: `title`, `cards` (KanbanCard: id, title, description, tags, assignee, priority), `onCardMove`, `onCardClick`, `wipLimit`, `columnId`
- [ ] **Step 3:** Add all sub-type tables
- [ ] **Step 4:** Commit: `docs: update Data Table & Tree pages to match source`

---

## Task 13: Text & Code Display (6 pages)

**Components:** CopyBlock, DiffViewer, JsonViewer, CodeEditor, RichTextEditor, Highlight (already in Task 7)

**Files to modify:**
- `demo/src/pages/components/CopyBlockPage.tsx`
- `demo/src/pages/components/DiffViewerPage.tsx`
- `demo/src/pages/components/JsonViewerPage.tsx`
- `demo/src/pages/components/CodeEditorPage.tsx`
- `demo/src/pages/components/RichTextEditorPage.tsx`

**Source reference:** full_context.md lines 4213-4455

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - CopyBlock: `code` (required), `language`, `showLineNumbers`, `highlight` (number[]), `maxHeight`, `title`
  - DiffViewer: `oldValue` (required), `newValue` (required), `oldTitle`, `newTitle`, `mode` ('side-by-side'|'unified'), `showLineNumbers`, `foldUnchanged`, `foldThreshold`, `language`
  - JsonViewer: `data` (required), `initialExpandDepth`, `collapsed`, `rootName`, `enableClipboard`, `displayDataTypes`, `displayObjectSize`, `theme`, `indentWidth`, `sortKeys`, `maxStringLength`
  - CodeEditor: `value`, `onChange`, `language`, `readOnly`, `showLineNumbers`, `lineNumberStart`, `placeholder`, `minHeight`, `maxHeight`, `wordWrap`, `tabSize`, `highlightActiveLine`
  - RichTextEditor: `value`, `onChange`, `placeholder`, `label`, `error`, `disabled`, `readOnly`, `minHeight` (default 120), `maxHeight`, `toolbar`, `size`
- [ ] **Step 3:** Commit: `docs: update Text & Code display pages to match source`

---

## Task 14: Data Visualization (8 pages)

**Components:** MetricCard, Sparkline, ThresholdGauge, RingChart, CoreChart, StorageBar, UtilizationBar, TimeSeriesChart

**Files to modify:**
- `demo/src/pages/components/MetricCardPage.tsx`
- `demo/src/pages/components/SparklinePage.tsx`
- `demo/src/pages/components/ThresholdGaugePage.tsx`
- `demo/src/pages/components/RingChartPage.tsx`
- `demo/src/pages/components/CoreChartPage.tsx`
- `demo/src/pages/components/StorageBarPage.tsx`
- `demo/src/pages/components/UtilizationBarPage.tsx`
- `demo/src/pages/components/TimeSeriesChartPage.tsx`

**Source reference:** full_context.md lines 4457-4856

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - MetricCard: `title` (required), `value` (required), `change`, `trend`, `status`, `icon`, `sparkline`, `loading`, `error`, `empty`
  - Sparkline: `data` (required), `width`, `height`, `color`, `gradient`, `showTooltip`, `animate`
  - ThresholdGauge: `value` (required), `thresholds`, `label`, `showValue`
  - RingChart: `value` (required), `max`, `thickness`, `color`, `label`, `showValue`, `animated`
  - CoreChart: `cores` (CoreChartCore sub-type: id, usage), `columns`, `showLabels`, `colorScale`
  - StorageBar: `segments` (StorageBarSegment: label, value, color), `total` (required), `showLabels`, `showLegend`
  - UtilizationBar: `segments` (UtilizationSegment: value, color, label), `max`, `thresholds`, `showLabels`
  - TimeSeriesChart: `series` (TimeSeriesSeries: id, label, data, color), `height`, `showXAxis`, `showYAxis`, `showGrid`, `showTooltip`, `showLegend`, `yMin`, `yMax`, `formatValue`, `formatTime`
- [ ] **Step 3:** Add all sub-type tables (CoreChartCore, StorageBarSegment, UtilizationSegment, TimeSeriesData, TimeSeriesSeries)
- [ ] **Step 4:** Commit: `docs: update Data Visualization pages to match source`

---

## Task 15: Data Visualization — Additional (2 pages)

**Components:** HeatmapCalendar, DateRangePicker

**Files to modify:**
- `demo/src/pages/components/HeatmapCalendarPage.tsx`
- `demo/src/pages/components/DateRangePickerPage.tsx`

**Source reference:** full_context.md lines 4858-4908 (HeatmapCalendar), 1241-1300 (DateRangePicker)

- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - HeatmapCalendar: `data` (HeatmapData: date, value), `colorScale`, `startDate`, `endDate`, `showTooltip`, `onDateClick`
  - DateRangePicker: `value`, `onChange`, `presets` (DateRangePreset: label, range), `minDate`, `maxDate`, `label`, `placeholder`, `size`, `error`
- [ ] **Step 3:** Add sub-type tables
- [ ] **Step 4:** Commit: `docs: update HeatmapCalendar & DateRangePicker pages`

---

## Task 16: Infrastructure & Monitoring (10 pages)

**Components:** RackDiagram, SeverityTimeline, LogViewer, PortStatusGrid, PipelineStage, UptimeTracker, SwitchFaceplate, NetworkTrafficCard, DashboardGrid, GeoMap

**Files to modify:**
- `demo/src/pages/components/RackDiagramPage.tsx`
- `demo/src/pages/components/SeverityTimelinePage.tsx`
- `demo/src/pages/components/LogViewerPage.tsx`
- `demo/src/pages/components/PortStatusGridPage.tsx`
- `demo/src/pages/components/PipelineStagePage.tsx`
- `demo/src/pages/components/UptimeTrackerPage.tsx`
- `demo/src/pages/components/SwitchFaceplatePage.tsx`
- `demo/src/pages/components/NetworkTrafficCardPage.tsx`
- `demo/src/pages/components/DashboardGridPage.tsx`
- `demo/src/pages/components/GeoMapPage.tsx`

**Source reference:** full_context.md lines 4911-5513

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable with ALL props and sub-types:
  - RackDiagram: `units` (required), `devices` (RackDevice: startU, heightU, label, status), `showUnitNumbers`, `orientation`
  - SeverityTimeline: `events` (TimelineEvent: id, timestamp, severity, title, description), `orientation`, `expandable`, `maxVisible`
  - LogViewer: `lines` (LogLine: id, timestamp, level, message), `maxLines`, `autoTail`, `showTimestamp`, `showLevel`, `search`, `filterLevel`, `wrap`, `height`
  - PortStatusGrid: `ports` (PortStatus: port, status, label), `columns` (default 8), `onPortClick`
  - PipelineStage: `stages` (Stage: id, label, status, duration), `orientation`, `onStageClick`
  - UptimeTracker: `days` (UptimeDay: date, status, uptime), `slaTarget`, `showSla`
  - SwitchFaceplate: `ports` (SwitchPort: id, label, status, speed, type, vlan), `rows`, `label`, `showLabels`, `onPortClick`
  - NetworkTrafficCard: `title` (required), `vendor`, `location`, `traffic` (TrafficData: inbound, outbound, timestamp), `trend`, `status`, `compact`
  - DashboardGrid: `groups` (DashboardGroup: id, title, description, summary, items, collapsed), `columns`, `gap`
  - GeoMap: `points` (GeoPoint: id, lat, lng, label, value, status, tooltip), `connections` (GeoConnection: from, to, value, status), `projection`, `showLabels`, `interactive`, `onPointClick`, `onPointHover`, `height`
- [ ] **Step 3:** Add ALL sub-type tables (there are many)
- [ ] **Step 4:** Commit: `docs: update Infrastructure & Monitoring pages to match source`

---

## Task 17: Monitoring — Additional (8 pages)

**Components:** UpstreamDashboard, DensitySelector, ColumnVisibilityToggle, PropertyList, EntityCard, ServiceStrip, DiskMountBar, ConnectionTestPanel

**Files to modify:**
- `demo/src/pages/components/UpstreamDashboardPage.tsx`
- `demo/src/pages/components/DensitySelectorPage.tsx`
- `demo/src/pages/components/ColumnVisibilityTogglePage.tsx`
- `demo/src/pages/components/PropertyListPage.tsx`
- `demo/src/pages/components/EntityCardPage.tsx`
- `demo/src/pages/components/ServiceStripPage.tsx`
- `demo/src/pages/components/DiskMountBarPage.tsx`
- `demo/src/pages/components/ConnectionTestPanelPage.tsx`

**Source reference:** full_context.md lines 5516-6952

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — critical:
  - UpstreamDashboard: MASSIVE component with `links` (UpstreamLink: id, vendor, location, inbound, outbound, capacity, burstCapacity, status, trend), `mode` ('hero'|'compact'|'table'), `showSummary`, `groupBy`, `lastUpdated`, `showCapacity`, `showBurstCapacity`, `showUtilization`, `utilizationDisplay` ('bar'|'meter'|'ambient'), `onLinkClick`, `onGroupClick`, `onSummaryClick`
  - DensitySelector: `value`, `defaultValue` (default 'comfortable'), `onChange`
  - ColumnVisibilityToggle: `columns` (required array), `onChange`, `onReset`
  - PropertyList: `items` (PropertyItem: label, value, copyable, mono, href), `columns` (1|2), `striped`
  - EntityCard: `name` (required), `type`, `status`, `icon`, `metrics`, `tags`, `href`, `actions`, `compact`
  - ServiceStrip: `services` (ServiceItem: name, status, version, icon), `maxVisible`, `onServiceClick`
  - DiskMountBar: `mounts` (MountInfo: mount, totalBytes, usedBytes, freeBytes, utilPct), `maxVisible`, `showFree`, `formatBytes`
  - ConnectionTestPanel: `steps` (TestStep: id, label, status, message, duration), `title`, `onRetry`, `onCancel`, `running`
- [ ] **Step 3:** Add all sub-type tables
- [ ] **Step 4:** Commit: `docs: update Additional Monitoring pages to match source`

---

## Task 18: AI & Realtime (8 pages)

**Components:** StreamingText, TypingIndicator, ConfidenceBar, LiveFeed, RealtimeValue, NotificationStack, DataTableSuggestions, InfiniteScroll

**Files to modify:**
- `demo/src/pages/components/StreamingTextPage.tsx`
- `demo/src/pages/components/TypingIndicatorPage.tsx`
- `demo/src/pages/components/ConfidenceBarPage.tsx`
- `demo/src/pages/components/LiveFeedPage.tsx`
- `demo/src/pages/components/RealtimeValuePage.tsx`
- `demo/src/pages/components/NotificationStackPage.tsx`
- `demo/src/pages/components/InfiniteScrollPage.tsx`

**Source reference:** full_context.md lines 5585-5802, 3732-3790 (NotificationStack), 6602-6643 (InfiniteScroll)

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - StreamingText: `text` (required), `streaming`, `showCursor`, `speed`, `onComplete`
  - TypingIndicator: `avatar`, `label`, `size`
  - ConfidenceBar: `value` (required), `label`, `showValue`, `thresholds` ({low, medium})
  - LiveFeed: `items` (FeedItem: id, content, timestamp, type), `maxItems`, `autoScroll`, `paused`, `onPause`, `onResume`, `connectionStatus`, `height`, `emptyMessage`
  - RealtimeValue: `value` (required), `previousValue`, `format`, `showDelta`, `flashOnChange`
  - NotificationStack: `notifications` (Notification: id, title, description, timestamp, variant, icon, read, group, action), `onDismiss`, `onDismissAll`, `onMarkAllRead`, `onMarkRead`, `maxVisible`, `emptyMessage`
  - InfiniteScroll: `onLoadMore` (required), `hasMore` (required), `loading`, `threshold` (default 200), `loader`, `endMessage`, `direction`, `pullToRefresh`, `onRefresh`
- [ ] **Step 3:** Add all sub-type tables
- [ ] **Step 4:** Commit: `docs: update AI & Realtime pages to match source`

---

## Task 19: Magic Effects (14 pages)

**Components:** BorderBeam, MeteorShower, GlowCard, TextReveal, OrbitingCircles, NumberTicker, Ripple, BackgroundBeams, WavyBackground, BackgroundBoxes, SpotlightCard, EvervaultCard, FlipWords, EncryptedText

**Files to modify:**
- `demo/src/pages/components/BorderBeamPage.tsx`
- `demo/src/pages/components/MeteorShowerPage.tsx`
- `demo/src/pages/components/GlowCardPage.tsx`
- `demo/src/pages/components/TextRevealPage.tsx`
- `demo/src/pages/components/OrbitingCirclesPage.tsx`
- `demo/src/pages/components/NumberTickerPage.tsx`
- `demo/src/pages/components/RipplePage.tsx`
- `demo/src/pages/components/BackgroundBeamsPage.tsx`
- `demo/src/pages/components/WavyBackgroundPage.tsx`
- `demo/src/pages/components/BackgroundBoxesPage.tsx`
- `demo/src/pages/components/SpotlightCardPage.tsx`
- `demo/src/pages/components/EvervaultCardPage.tsx`
- `demo/src/pages/components/FlipWordsPage.tsx`
- `demo/src/pages/components/EncryptedTextPage.tsx`

**Source reference:** full_context.md lines 5805-6316

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - BorderBeam: `duration` (default 5), `color`, `size` (default 80)
  - MeteorShower: `count` (default 20)
  - GlowCard: `glowColor`
  - TextReveal: `text` (required), `trigger` ('mount'|'inView'), `speed` (default 30)
  - OrbitingCircles: `radius`, `duration`, `reverse`
  - NumberTicker: `value` (required), `direction` ('up'|'down'), `delay` (default 0)
  - Ripple: `color`, `duration` (default 600)
  - BackgroundBeams: `count` (default 6), `color`
  - WavyBackground: `waveCount`, `speed`, `color`
  - BackgroundBoxes: `rows` (default 15), `cols` (default 15)
  - SpotlightCard: `spotlightColor`
  - EvervaultCard: just `children` and `motion`
  - FlipWords: `words` (required), `interval` (default 3000)
  - EncryptedText: `text` (required), `trigger` ('mount'|'hover'|'inView'), `speed` (default 2), `scrambleChars`
- [ ] **Step 3:** Commit: `docs: update Magic Effects pages to match source`

---

## Task 20: Remaining Components (7 pages)

**Components:** HeroHighlight, TracingBeam, ResponsiveCard, StepWizard, ScrollReveal, ViewTransitionLink, Card3D, CsvExport, TimeRangeSelector

**Files to modify:**
- `demo/src/pages/components/HeroHighlightPage.tsx`
- `demo/src/pages/components/TracingBeamPage.tsx`
- `demo/src/pages/components/ResponsiveCardPage.tsx`
- `demo/src/pages/components/StepWizardPage.tsx`
- `demo/src/pages/components/ScrollRevealPage.tsx`
- `demo/src/pages/components/ViewTransitionLinkPage.tsx`
- `demo/src/pages/components/Card3dPage.tsx`
- `demo/src/pages/components/CsvExportPage.tsx`
- `demo/src/pages/components/TimeRangeSelectorPage.tsx`

**Source reference:** full_context.md lines 6319-6712

For each page:
- [ ] **Step 1:** Read source and current pages
- [ ] **Step 2:** Update PropsTable — key props:
  - HeroHighlight: just `children` and `motion`
  - TracingBeam: `color`, `children`
  - ResponsiveCard: `image`, `title` (required), `description`, `actions`, `badge`, `variant` ('default'|'horizontal'|'compact')
  - StepWizard: `steps` (Step: id, label, description, icon, validate), `activeStep`, `defaultStep`, `onChange`, `orientation`, `allowSkip`
  - ScrollReveal: `animation` (6 values), `delay`, `stagger`, `threshold` (default 0.1), `once` (default true)
  - ViewTransitionLink: `transitionName`
  - TimeRangeSelector: `presets` (TimeRangePreset: label, value, range), `value`, `onChange`, `showCustom`
- [ ] **Step 3:** Add Step sub-type and TimeRangePreset sub-type tables
- [ ] **Step 4:** Commit: `docs: update remaining component pages to match source`

---

## Task 21: UIProvider & Utility Pages

**Files to modify:**
- `demo/src/pages/components/EmptyStatePage.tsx` (if not already covered)
- `demo/src/pages/DocsPage.tsx` — verify docs tabs match current features
- `demo/src/pages/Home.tsx` — verify component counts, feature descriptions

**Source reference:** full_context.md lines 3587-3612 (UIProvider), 1-116 (Overview)

- [ ] **Step 1:** Verify UIProvider documentation exists somewhere — props: `children`, `theme`, `mode` ('dark'|'light'), `motion` (default 3), `density`, `onModeChange`
- [ ] **Step 2:** Verify Home.tsx component counts match (95 standard + 116 domain = 211 total, 145 lite, 145 premium)
- [ ] **Step 3:** Verify DocsPage overview matches current version (v2.7.0), entry points, CLI commands
- [ ] **Step 4:** Verify theme system docs list all 15 themes and 24+ CSS token variables
- [ ] **Step 5:** Verify form engine docs list all 11 validators
- [ ] **Step 6:** Verify icon system docs list all 50 icons
- [ ] **Step 7:** Commit: `docs: update utility pages and UIProvider docs`

---

## Task 22: Final Verification

- [ ] **Step 1:** Run `npm run build` in the demo to ensure no TypeScript errors from prop changes
- [ ] **Step 2:** Spot-check 5 random component pages to verify PropsTable completeness
- [ ] **Step 3:** Verify the GeneratorPage component gallery still renders all components
- [ ] **Step 4:** Run `npm run typecheck` on the main library
- [ ] **Step 5:** Commit any final fixes

---

## Execution Notes

### Parallel Execution
Tasks 1-20 are completely independent and can be dispatched to parallel subagents. Each agent needs:
1. Access to `/home/devesh/full_context.md` (the source of truth)
2. Access to the specific component page files
3. Understanding of the PropsTable format from `demo/src/components/PropsTable.tsx`

### PropsTable Format
Each prop in PropsTable follows this interface:
```typescript
interface PropDef {
  name: string
  type: string
  default?: string
  required?: boolean
  description: string
}
```

### Common Mistakes to Avoid
- Don't add internal props (Calendar's `_rangeStart`, `_rangeEnd`, etc.)
- Don't include inherited HTML attributes in PropsTable (className, style, etc. are assumed)
- Keep descriptions concise — match the full_context.md descriptions
- Use exact type strings from full_context.md (e.g., `'primary' | 'secondary' | 'ghost' | 'danger' | 'link'` not just `string`)
