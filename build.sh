#!/bin/bash
# Rebuilds index.html from src/
cd "$(dirname "$0")/src"
{ echo '<!doctype html><html lang="he"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
cat head.html; cat body.html
echo '<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>'
echo '<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/controls/OrbitControls.js"></script>'
echo '<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/environments/RoomEnvironment.js"></script>'
echo "<script>"; cat shapes.js app.js show.js memorial.js welcome.js icons.js editor2d.js ai.js; echo "</script></html>"; } > ../index.html
