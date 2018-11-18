 5
0
https://github.com/SkyhacksPL/Challenges







Message List
1 new message since 2:09 PM on November 18th
Mark as read

Filip R [2:27 PM]
Untitled
import re
import cv2
import numpy as np
import pytesseract
import os
from os.path import isfile, join
​
from tqdm import tqdm
​
path = './0_63/0_63_right/'
​
pliki = [f for f in os.listdir(path) if isfile(join(path, f))]
​
​
​
def process_file(path) -> str:
​
  img = cv2.imread(path)
​
  # convert to grayscale
  gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
​
​
  img_g = cv2.bilateralFilter(gray, 5, 40, 40)
  img_g = cv2.bitwise_not(img_g)
  ret, img_g = cv2.threshold(img_g, 110, 255, cv2.THRESH_BINARY)
​
​
  # Find the contours
  copy = cv2.bilateralFilter(img_g, 13, 50, 50)
  copy = cv2.dilate(copy,None,iterations = 4)
  copy = cv2.erode(copy,None,iterations = 4)
​
  image,contours,hierarchy = cv2.findContours(copy,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
​
  cv2.drawContours(img, contours, -1, (0,255,0), 3)
​
  config = ('-l eng --oem 1 --psm 1')
​
  roi = []
  for c in contours:
    x, y, w, h = cv2.boundingRect(c)
    if w > 500 or w < 6 or h > 200 or h < 10:
      continue
​
    roi.append((x ,y ,w ,h))
​
​
  def distance(r1, r2):
    if (r1[0] + r1[2] < r2[0] or r2[0] + r2[2] < r1[0]):
      dx = min(abs(r1[0] + r1[2] - r2[0]), abs(r2[0] + r2[2] - r1[0]))
    else:
      dx = 0
​
    if (r1[1] + r1[3] < r2[1] or r2[1] + r2[3] < r1[1]):
      dy = min(abs(r1[1] + r1[3] - r2[1]), abs(r2[1] + r2[3] - r1[1]))
    else:
      dy = 0
    return dx + dy
​
​
  def merge(r1, r2):
    x = min(abs(r1[0]), abs(r2[0]))
    w = max(r1[0] + r1[2], r2[0] + r2[2]) - x
​
    y = min(abs(r1[1]), abs(r2[1]))
    h = max(r1[1] + r1[3], r2[1] + r2[3]) - y
​
    return x, y, w, h
​
​
  merged_roi = [list(roi).pop()]
​
  while roi:
    r = roi.pop()
​
    for i, r2 in enumerate(merged_roi):
      if distance(r, r2) < 30:
        r = merge(r, r2)
        merged_roi.remove(r2)
        roi.append(r)
        break
    else:
      merged_roi.append(r)
​
​
  def expand_rect(rect):
    size = 20
    x, y, w, h = rect
​
    x = max(0, x - size)
    y = max(0, y - size)
​
    if w + size > img.shape[0]:
      w = img.shape[0] - x
    else:
      w = w + size
​
    if h + size > img.shape[1]:
      h = img.shape[1] - y
    else:
      h = h + size
​
    return x, y, w, h
​
​
  merged_roi = map(expand_rect, merged_roi)
​
  # For each contour, find the bounding rectangle and draw it
  for x,y,w,h in merged_roi:
    # if not (600 > w > 30 and 400 > h > 30):
    #   continue
​
    cv2.rectangle(img,(x,y),(x+w,y+h),(0,255,0),2)
    # cv2.rectangle(thresh_color,(x,y),(x+w,y+h),(0,255,0),2)
​
    crop_img = img_g[y:y + h, x:x + w]
​
    # clahe = cv2.createCLAHE(clipLimit=1.0, tileGridSize=(4, 4))
    #
    # th3 = clahe.apply(crop_img)
​
    text = pytesseract.image_to_string(crop_img, config=config).strip().replace('A', '4')
      # import pdb;
      #
      # pdb.set_trace()
    match = re.search(r'(\d{4,4}) ?(\d{3,3})-?(\d)', text)
    if match:
      return match.group(1) + match.group(2) + '-' + match.group(3)
​
​
  # # Finally show the image
  # cv2.imshow('img',img)
  # cv2.imshow('img_g',img_g)
  # cv2.imshow('copy ',copy )
  #
  # # cv2.imshow('res', thresh_color)
  # cv2.waitKey(0)
  # cv2.destroyAllWindows()
​
​
for name in tqdm(pliki[34:]):
  code = process_file(path + name)
​
  if code:
    with open(name.replace('.jpg', '.txt'), 'w+') as f:
      f.write(code)
Collapse

Message Input

Message #general
