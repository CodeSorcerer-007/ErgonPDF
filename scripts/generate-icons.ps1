Add-Type -AssemblyName System.Drawing

function Create-ErgonIcon([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = [float]$size / 64.0

    # 1. Dark Rounded Container
    $radius = [Math]::Max(1.0, 16.0 * $scale)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc([float]0.0, [float]0.0, [float]($radius * 2.0), [float]($radius * 2.0), [float]180.0, [float]90.0)
    $path.AddArc([float]($size - $radius * 2.0), [float]0.0, [float]($radius * 2.0), [float]($radius * 2.0), [float]270.0, [float]90.0)
    $path.AddArc([float]($size - $radius * 2.0), [float]($size - $radius * 2.0), [float]($radius * 2.0), [float]($radius * 2.0), [float]0.0, [float]90.0)
    $path.AddArc([float]0.0, [float]($size - $radius * 2.0), [float]($radius * 2.0), [float]($radius * 2.0), [float]90.0, [float]90.0)
    $path.CloseFigure()

    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 15, 23, 42)) # #0F172A
    $g.FillPath($bgBrush, $path)

    # 2. Document Shape with Gradient
    $docPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    [System.Drawing.PointF[]]$docPoints = @(
        (New-Object System.Drawing.PointF([float](16.0 * $scale), [float](12.0 * $scale))),
        (New-Object System.Drawing.PointF([float](38.0 * $scale), [float](8.0 * $scale))),
        (New-Object System.Drawing.PointF([float](52.0 * $scale), [float](22.0 * $scale))),
        (New-Object System.Drawing.PointF([float](52.0 * $scale), [float](52.0 * $scale))),
        (New-Object System.Drawing.PointF([float](48.0 * $scale), [float](56.0 * $scale))),
        (New-Object System.Drawing.PointF([float](20.0 * $scale), [float](56.0 * $scale))),
        (New-Object System.Drawing.PointF([float](16.0 * $scale), [float](52.0 * $scale)))
    )
    $docPath.AddPolygon($docPoints)
    $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF([float](8.0 * $scale), [float](8.0 * $scale))),
        (New-Object System.Drawing.PointF([float](56.0 * $scale), [float](56.0 * $scale))),
        [System.Drawing.Color]::FromArgb(255, 99, 102, 241), # #6366F1
        [System.Drawing.Color]::FromArgb(255, 236, 72, 153) # #EC4899
    )
    $g.FillPath($gradBrush, $docPath)

    # 3. Folded Corner
    $foldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    [System.Drawing.PointF[]]$foldPoints = @(
        (New-Object System.Drawing.PointF([float](38.0 * $scale), [float](8.0 * $scale))),
        (New-Object System.Drawing.PointF([float](38.0 * $scale), [float](22.0 * $scale))),
        (New-Object System.Drawing.PointF([float](52.0 * $scale), [float](22.0 * $scale)))
    )
    $foldPath.AddPolygon($foldPoints)
    $foldBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF([float](38.0 * $scale), [float](8.0 * $scale))),
        (New-Object System.Drawing.PointF([float](52.0 * $scale), [float](22.0 * $scale))),
        [System.Drawing.Color]::FromArgb(255, 192, 132, 252), # #C084FC
        [System.Drawing.Color]::FromArgb(255, 129, 140, 248) # #818CF8
    )
    $g.FillPath($foldBrush, $foldPath)

    # 4. Symbol (White Loop)
    $penWidth = [Math]::Max(1.5, 3.2 * $scale)
    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float]$penWidth)
    $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    $loopPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $loopPath.AddBezier(
        [float](25.0 * $scale), [float](36.0 * $scale),
        [float](25.0 * $scale), [float](30.0 * $scale),
        [float](33.0 * $scale), [float](30.0 * $scale),
        [float](34.0 * $scale), [float](36.0 * $scale)
    )
    $loopPath.AddBezier(
        [float](34.0 * $scale), [float](36.0 * $scale),
        [float](35.0 * $scale), [float](42.0 * $scale),
        [float](43.0 * $scale), [float](42.0 * $scale),
        [float](43.0 * $scale), [float](36.0 * $scale)
    )
    $loopPath.AddBezier(
        [float](43.0 * $scale), [float](36.0 * $scale),
        [float](43.0 * $scale), [float](30.0 * $scale),
        [float](35.0 * $scale), [float](30.0 * $scale),
        [float](34.0 * $scale), [float](36.0 * $scale)
    )
    $loopPath.AddBezier(
        [float](34.0 * $scale), [float](36.0 * $scale),
        [float](33.0 * $scale), [float](42.0 * $scale),
        [float](25.0 * $scale), [float](42.0 * $scale),
        [float](25.0 * $scale), [float](36.0 * $scale)
    )
    $g.DrawPath($whitePen, $loopPath)

    $g.Dispose()
    return $bmp
}

# Generate PNGs
$bmp512 = Create-ErgonIcon 512
$bmp512.Save("public\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Dispose()

$bmp192 = Create-ErgonIcon 192
$bmp192.Save("public\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp192.Dispose()

# Generate multi-res ICO file containing 16, 32, 48, 64, 128, 256
$sizes = @(16, 32, 48, 64, 128, 256)
$imagesData = @()

foreach ($sz in $sizes) {
    $b = Create-ErgonIcon $sz
    $ms = New-Object System.IO.MemoryStream
    $b.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $imagesData += ,@($sz, $ms.ToArray())
    $ms.Dispose()
    $b.Dispose()
}

$icoStream = New-Object System.IO.FileStream("public\icon.ico", [System.IO.FileMode]::Create)
$writer = New-Object System.IO.BinaryWriter($icoStream)

# Header
$writer.Write([UInt16]0) # Reserved
$writer.Write([UInt16]1) # Type (1 = ICO)
$writer.Write([UInt16]$sizes.Count) # Count

# Entries offset starts after Header (6 bytes) + Directory Entries (16 bytes * count)
$offset = 6 + (16 * $sizes.Count)

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $sz = $imagesData[$i][0]
    $bytes = $imagesData[$i][1]
    
    $w = if ($sz -ge 256) { 0 } else { [byte]$sz }
    $h = if ($sz -ge 256) { 0 } else { [byte]$sz }
    
    $writer.Write([byte]$w)
    $writer.Write([byte]$h)
    $writer.Write([byte]0) # Color palette count (0 for 32bpp)
    $writer.Write([byte]0) # Reserved
    $writer.Write([UInt16]1) # Color planes
    $writer.Write([UInt16]32) # Bits per pixel
    $writer.Write([UInt32]$bytes.Length) # Image data size
    $writer.Write([UInt32]$offset) # Offset
    $offset += $bytes.Length
}

# Image Data
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $bytes = $imagesData[$i][1]
    $writer.Write($bytes)
}

$writer.Close()
$icoStream.Close()

Write-Host "Success: Generated public\icon.ico, public\icon-192.png, public\icon-512.png"
